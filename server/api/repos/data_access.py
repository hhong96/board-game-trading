import re

from datetime import date

from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from datetime import date
from flask import jsonify
# import pandas as pd

from api.util import FormError, ApiError

engine = create_engine("postgresql://postgres@localhost:5432/postgres",
                       echo=True,
                       connect_args={'options': '-csearch_path=cs6400'})


def get_user_profile(email: str):
    """
    Attempt to retrieve the complete User record

    :param str email
    """
    with engine.connect() as conn:
        results = conn.execute(
            text("""
                SELECT email, nickname, first_name, last_name, u.postal_code, trades_completed, first_name || ' ' || last_name as fullname,
                  pa.city || ', ' || pa.state || ' ' || pa.postal_code as location  
                FROM "User" u
                INNER JOIN "PostalAddress" pa
                ON u.postal_code = pa.postal_code
                WHERE email = :email
                """), {"email": email})

        rows = results.all()

        if not rows:
            raise ApiError("User not found")

        return dict(rows[0]._mapping)


def get_user(login: dict):
    """
    Attempt to retrieve the User record associated with login form content

    :param dict login: Content of the form field
    """
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
            SELECT email, nickname, password, postal_code
            FROM "User"
            WHERE email = :email OR nickname = :nickname 
            """, ), {
                    "email": login.get("emailOrNickname"),
                    "nickname": login.get("emailOrNickname")
                })

        rows = result.all()

        if not rows:
            raise FormError(emailOrNickname="The user is not registered")

        if len(rows) > 1:
            raise FormError(
                emailOrNickname=
                "Database is inconsistent.  Received multiple users with nickname/email"
            )

        return rows[0]


def register_user(register: dict):
    """
    Attempt to register a new User

    :param dict register: Content of the register form
    """

    with engine.connect() as conn:
        try:
            result = conn.execute(
                text("""
                insert into "User" (email, password, first_name, last_name, nickname, postal_code, trades_completed)
                values (:email, :password, :first_name, :last_name, :nickname, :postal_code, :trades_completed)
                """), {
                    'email': register.get("email"),
                    'password': register.get('password'),
                    "first_name": register.get("firstName"),
                    "last_name": register.get("lastName"),
                    'nickname': register.get('nickname'),
                    'postal_code': register.get('postalCode'),
                    "trades_completed": 0
                })

            if result.rowcount:
                return
            else:
                raise FormError(
                    form=
                    "Unable to register use because an unexpected error occurred"
                )
        except IntegrityError as ie:
            error_message = str(ie.orig)
            if re.search('User_email_key', error_message):
                raise FormError(email="Email is already in use")
            elif re.search('User_nickname_key', error_message):
                raise FormError(nickname="Nickname is already in use")
            elif re.search('fk_User_addressId_Address_addressId',
                           error_message):
                raise FormError(postalCode="Postal Code is invalid")

            raise ie


def get_trade(tradeStatus: dict):
    """
        Attempt to view all pending trades, so user can decide to accept or reject
    """
    pass


def keyword_search(search: dict):
    cleanKeyword = '%' + str(search.get("keyword")) + '%'
    """
    Search for items

    :param dict search: Return results of a search
    """

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            WITH "RK" AS
                (SELECT sum("sum".cnt) AS Cnt, "sum".email
                FROM (SELECT COUNT(*) as cnt, pp_email as "email" from "Trade" WHERE trade_status is true GROUP BY pp_email
                UNION ALL
                SELECT COUNT(*) as cnt, cp_email as "email" from "Trade" WHERE trade_status is true group by cp_email) "sum"
                group by "sum".email ),

                
            "ALL" AS (
                
            SELECT I.Item_No,
                I.Game_Type,
                I.Title,
                I.Condition,
                CASE WHEN LENGTH(substring(I.Description for 100)) >= 100 THEN substring(I.Description for 100) || '...' ELSE substring(I.description for 100) END as "description",
                ROUND(avg("IUT".response)) AS "response", 
                round(CAST(point((SELECT longitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code)),
                        (SELECT latitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code))) <@>
                        (point(IUA.longitude, IUA.latitude)) AS numeric),2) as distance,
                IU.postal_code,
                CASE WHEN "RK".Cnt = 0 THEN 'None'
                    WHEN "RK".cnt >= 1 AND "RK".Cnt <= 2 THEN 'Aluminum'
                    WHEN "RK".Cnt = 3 THEN 'Bronze'
                    WHEN "RK".Cnt >= 4 AND "RK".Cnt <= 5 THEN 'Silver'
                    WHEN "RK".Cnt >= 6 AND "RK".Cnt <= 7 THEN 'Gold'
                    WHEN "RK".Cnt >= 8 AND "RK".Cnt <= 9 THEN 'Platinum'
                    WHEN "RK".Cnt >= 10 THEN 'Alexandinium' END as RANK

            FROM "Item" I
                INNER JOIN "User" IU on I.Owner_Email = IU.Email 
                INNER JOIN "PostalAddress" IUA on IU.postal_code = IUA.postal_code
                LEFT JOIN ( SELECT T.cp_email AS "email", T.transaction_Date::Date - T.Proposal_Date::Date AS "response"
                        FROM "Trade" T) "IUT" on "IUT".email = IU.email
                INNER JOIN "RK" on IU.email = "RK".email
                WHERE I.Item_No IN (
                            SELECT Item_No
                            FROM "Item"
                            WHERE "Item".Item_no NOT IN 
                            (
                                SELECT Desired_Item_no AS Item
                                FROM "Trade"
                                WHERE "Trade".Cp_email = :email
                                    AND ("Trade".Trade_status IS True OR
                                                "Trade".Trade_status IS NULL)
                                UNION 
                                SELECT Proposed_Item_no AS Item
                                FROM "Trade"
                                WHERE "Trade".Pp_email = :email
                                    AND ("Trade".Trade_status IS True OR
                                                "Trade".Trade_status IS NULL)
                            )
                        )
            GROUP BY 
                I.Item_No, 
                I.Game_Type, 
                I.Title, 
                I.Condition, 
                I.Description,  
                IU.postal_code,
                round(CAST(point((SELECT longitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code)),
                        (SELECT latitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code))) <@>
                        (point(IUA.longitude, IUA.latitude)) AS numeric),2),
                CASE WHEN "RK".Cnt = 0 THEN 'None'
                    WHEN "RK".cnt >= 1 AND "RK".Cnt <= 2 THEN 'Aluminum'
                    WHEN "RK".Cnt = 3 THEN 'Bronze'
                    WHEN "RK".Cnt >= 4 AND "RK".Cnt <= 5 THEN 'Silver'
                    WHEN "RK".Cnt >= 6 AND "RK".Cnt <= 7 THEN 'Gold'
                    WHEN "RK".Cnt >= 8 AND "RK".Cnt <= 9 THEN 'Platinum'
                    WHEN "RK".Cnt >= 10 THEN 'Alexandinium' END)

            SELECT * FROM "ALL" WHERE "ALL".Title LIKE :keyword OR "ALL".Description LIKE :keyword
            ORDER BY "ALL".distance asc, "ALL".item_no asc
            """), {
                "email": search.get("email"),
                "postal_code": int(search.get("userPostalCode")),
                "keyword": cleanKeyword
            })

        rows = result.all()
        for row in result:
            print("row thing: ", row)

        if len(rows) >= 1:
            # print(jsonify({'result': [dict(row) for row in rows]}))
            return jsonify({'result': [dict(row) for row in rows]})
        elif len(rows) == 0:
            return {}
        else:
            print("this is bs")
            raise FormError(
                form=
                "Unable to search for items by keyword because an unexpected error occurred"
            )


def within_postal_code_search(search: dict):
    """
    Search for items

    :param dict search: Return results of a search
    """

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            WITH "RK" AS
                (SELECT sum("sum".cnt) AS Cnt, "sum".email
                FROM (SELECT COUNT(*) as cnt, pp_email as "email" from "Trade" WHERE trade_status is true GROUP BY pp_email
                UNION ALL
                SELECT COUNT(*) as cnt, cp_email as "email" from "Trade" WHERE trade_status is true group by cp_email) "sum"
                group by "sum".email ),

                
            "ALL" AS (
                
            SELECT I.Item_No,
                I.Game_Type,
                I.Title,
                I.Condition,
                CASE WHEN LENGTH(substring(I.Description for 100)) >= 100 THEN substring(I.Description for 100) || '...' ELSE substring(I.description for 100) END as "description",
                ROUND(avg("IUT".response)) AS "response", 
                round(CAST(point((SELECT longitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code)),
                        (SELECT latitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code))) <@>
                        (point(IUA.longitude, IUA.latitude)) AS numeric),2) as distance,
                IU.postal_code,
                CASE WHEN "RK".Cnt = 0 THEN 'None'
                    WHEN "RK".cnt >= 1 AND "RK".Cnt <= 2 THEN 'Aluminum'
                    WHEN "RK".Cnt = 3 THEN 'Bronze'
                    WHEN "RK".Cnt >= 4 AND "RK".Cnt <= 5 THEN 'Silver'
                    WHEN "RK".Cnt >= 6 AND "RK".Cnt <= 7 THEN 'Gold'
                    WHEN "RK".Cnt >= 8 AND "RK".Cnt <= 9 THEN 'Platinum'
                    WHEN "RK".Cnt >= 10 THEN 'Alexandinium' END as RANK

            FROM "Item" I
                INNER JOIN "User" IU on I.Owner_Email = IU.Email 
                INNER JOIN "PostalAddress" IUA on IU.postal_code = IUA.postal_code
                LEFT JOIN ( SELECT T.cp_email AS "email", T.transaction_Date::Date - T.Proposal_Date::Date AS "response"
                        FROM "Trade" T) "IUT" on "IUT".email = IU.email
                INNER JOIN "RK" on IU.email = "RK".email
                WHERE I.Item_No IN (
                            SELECT Item_No
                            FROM "Item"
                            WHERE "Item".Item_no NOT IN 
                            (
                                SELECT Desired_Item_no AS Item
                                FROM "Trade"
                                WHERE "Trade".Cp_email = :email
                                    AND ("Trade".Trade_status IS True OR
                                                "Trade".Trade_status IS NULL)
                                UNION 
                                SELECT Proposed_Item_no AS Item
                                FROM "Trade"
                                WHERE "Trade".Pp_email = :email
                                    AND ("Trade".Trade_status IS True OR
                                                "Trade".Trade_status IS NULL)
                            )
                        )
            GROUP BY 
                I.Item_No, 
                I.Game_Type, 
                I.Title, 
                I.Condition, 
                I.Description,  
                IU.postal_code,
                round(CAST(point((SELECT longitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code)),
                        (SELECT latitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code))) <@>
                        (point(IUA.longitude, IUA.latitude)) AS numeric),2),
                CASE WHEN "RK".Cnt = 0 THEN 'None'
                    WHEN "RK".cnt >= 1 AND "RK".Cnt <= 2 THEN 'Aluminum'
                    WHEN "RK".Cnt = 3 THEN 'Bronze'
                    WHEN "RK".Cnt >= 4 AND "RK".Cnt <= 5 THEN 'Silver'
                    WHEN "RK".Cnt >= 6 AND "RK".Cnt <= 7 THEN 'Gold'
                    WHEN "RK".Cnt >= 8 AND "RK".Cnt <= 9 THEN 'Platinum'
                    WHEN "RK".Cnt >= 10 THEN 'Alexandinium' END)

            SELECT * FROM "ALL" WHERE ( "ALL".Postal_Code = :postal_code ) 
            ORDER BY "ALL".distance asc, "ALL".item_no asc
            """), {
                "postal_code": int(search.get("withinPostalCode")),
                "email": search.get("email")
            })
        rows = result.all()
        for row in result:
            print("row thing: ", row)

        if len(rows) >= 1:
            # print(jsonify({'result': [dict(row) for row in rows]}))
            return jsonify({'result': [dict(row) for row in rows]})
        elif len(rows) == 0:
            return {}
        else:
            raise FormError(
                form=
                "Unable to search for items by keyword because an unexpected error occurred"
            )


def radius_search(search: dict):
    """
    Search for items

    :param dict search: Return results of a search
    """

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            WITH "RK" AS
                (SELECT sum("sum".cnt) AS Cnt, "sum".email
                FROM (SELECT COUNT(*) as cnt, pp_email as "email" from "Trade" WHERE trade_status is true GROUP BY pp_email
                UNION ALL
                SELECT COUNT(*) as cnt, cp_email as "email" from "Trade" WHERE trade_status is true group by cp_email) "sum"
                group by "sum".email ),

                
            "ALL" AS (
                
            SELECT I.Item_No,
                I.Game_Type,
                I.Title,
                I.Condition,
                CASE WHEN LENGTH(substring(I.Description for 100)) >= 100 THEN substring(I.Description for 100) || '...' ELSE substring(I.description for 100) END as "description",
                ROUND(avg("IUT".response)) AS "response", 
                round(CAST(point((SELECT longitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code)),
                        (SELECT latitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code))) <@>
                        (point(IUA.longitude, IUA.latitude)) AS numeric),2) as distance,
                IU.postal_code,
                CASE WHEN "RK".Cnt = 0 THEN 'None'
                    WHEN "RK".cnt >= 1 AND "RK".Cnt <= 2 THEN 'Aluminum'
                    WHEN "RK".Cnt = 3 THEN 'Bronze'
                    WHEN "RK".Cnt >= 4 AND "RK".Cnt <= 5 THEN 'Silver'
                    WHEN "RK".Cnt >= 6 AND "RK".Cnt <= 7 THEN 'Gold'
                    WHEN "RK".Cnt >= 8 AND "RK".Cnt <= 9 THEN 'Platinum'
                    WHEN "RK".Cnt >= 10 THEN 'Alexandinium' END as RANK

            FROM "Item" I
                INNER JOIN "User" IU on I.Owner_Email = IU.Email 
                INNER JOIN "PostalAddress" IUA on IU.postal_code = IUA.postal_code
                LEFT JOIN ( SELECT T.cp_email AS "email", T.transaction_Date::Date - T.Proposal_Date::Date AS "response"
                        FROM "Trade" T) "IUT" on "IUT".email = IU.email
                INNER JOIN "RK" on IU.email = "RK".email
                WHERE I.Item_No IN (
                            SELECT Item_No
                            FROM "Item"
                            WHERE "Item".Item_no NOT IN 
                            (
                                SELECT Desired_Item_no AS Item
                                FROM "Trade"
                                WHERE "Trade".Cp_email = :email
                                    AND ("Trade".Trade_status IS True OR
                                                "Trade".Trade_status IS NULL)
                                UNION 
                                SELECT Proposed_Item_no AS Item
                                FROM "Trade"
                                WHERE "Trade".Pp_email = :email
                                    AND ("Trade".Trade_status IS True OR
                                                "Trade".Trade_status IS NULL)
                            )
                        )
            GROUP BY 
                I.Item_No, 
                I.Game_Type, 
                I.Title, 
                I.Condition, 
                I.description,  
                IU.postal_code,
                round(CAST(point((SELECT longitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code)),
                        (SELECT latitude FROM "User" INNER JOIN "PostalAddress" ON "User".postal_code = "PostalAddress".postal_code WHERE ("User".email = :email AND "User".postal_code = :postal_code))) <@>
                        (point(IUA.longitude, IUA.latitude)) AS numeric),2),
                CASE WHEN "RK".Cnt = 0 THEN 'None'
                    WHEN "RK".cnt >= 1 AND "RK".Cnt <= 2 THEN 'Aluminum'
                    WHEN "RK".Cnt = 3 THEN 'Bronze'
                    WHEN "RK".Cnt >= 4 AND "RK".Cnt <= 5 THEN 'Silver'
                    WHEN "RK".Cnt >= 6 AND "RK".Cnt <= 7 THEN 'Gold'
                    WHEN "RK".Cnt >= 8 AND "RK".Cnt <= 9 THEN 'Platinum'
                    WHEN "RK".Cnt >= 10 THEN 'Alexandinium' END)

            SELECT * FROM "ALL" WHERE (
                "ALL".Postal_Code = :postal_code
                                    or 
                "ALL".distance <= :distance
                                    )
            ORDER BY "ALL".distance asc, "ALL".item_no asc
            """), {
                "email": search.get("email"),
                "postal_code": int(search.get("userPostalCode")),
                "distance": search.get("withinRadius")
            })

        rows = result.all()
        for row in result:
            print("row thing: ", row)

        if len(rows) >= 1:
            # print(jsonify({'result': [dict(row) for row in rows]}))
            return jsonify({'result': [dict(row) for row in rows]})
        elif len(rows) == 0:
            return {}
        else:
            raise FormError(
                form=
                "Unable to search for items by keyword because an unexpected error occurred"
            )


def get_unaccepted_trades(email: str) -> int:
    with engine.connect() as conn:
        sql = text("""
            SELECT count(*) as unaccepted_count 
            FROM "Trade" t JOIN "User" u
            ON u.email = t.cp_email
            WHERE u.email = :email
            AND t.transaction_date is NULL
           """)

        results = conn.execute(sql, {'email': email})
        rows = results.all()
        if not rows:
            raise ApiError("An unexpected error occurred")

        return rows[0]['unaccepted_count']


def can_respond_to_trade_request(email: str) -> bool:
    """
    Whether the user identified by the supplied email has fewer than 2 unaccepted/rejected trade requests
    """
    with engine.connect() as conn:
        sql = text("""
            SELECT count(*) as unaccepted_count 
            FROM "Trade" t JOIN "User" u
            ON u.email = t.cp_email
            WHERE u.email = :email
            AND t.transaction_date is NULL
            HAVING count(*) < 2
           """)

        rows = conn.execute(sql, {'email': email}).all()

        # If the result set is empty then the user has at least 2 unaccepted trades, so they can only respond
        # to a trade request if the result set is non-empty
        return len(rows) > 0


def is_item_available(item_no: int) -> bool:
    """
    Returns true if the item is available to participate in a trade.  An item is unavailable if it participated in a previously accepted trade.
    """
    with engine.connect() as conn:
        sql = text("""
            SELECT trade_id 
            FROM "Trade" t 
            WHERE proposed_item_no = :item_no
            OR desired_item_no = :item_no
            AND ((transaction_date IS NOT NULL AND trade_status is true) OR (transaction_date IS NULL));
           """)

        rows = conn.execute(sql, {'item_no': item_no}).all()

        # If the result set is non-empty then the item has been traded
        return not len(rows)
    pass


def get_average_trade_response_time(email: str) -> float:
    with engine.connect() as conn:
        sql = text("""
            WITH time AS (
                SELECT COALESCE(AVG(transaction_date - proposal_date), 0) as response_time
                FROM "Trade" t JOIN "User" u
                ON u.email = t.cp_email
                WHERE u.email = :email
                AND t.transaction_date is NOT NULL
            )
            SELECT CASE
                WHEN time.response_time = 0 THEN 'None'
                WHEN time.response_time > 0 THEN time.response_time::text
            END "response_time"
            FROM time
           """)

        results = conn.execute(sql, {'email': email})
        rows = results.all()
        if not rows:
            raise ApiError("User not found")

        return rows[0]['response_time']


def get_completed_trades(email: str):
    with engine.connect() as conn:
        sql = text("""
            WITH history AS (
                SELECT COUNT(*) AS Cnt 
                FROM "Trade"
                WHERE trade_status is true 
                AND (cp_email = :email or pp_email = :email)
            )
            SELECT CASE
                WHEN history.Cnt = 0 THEN 'None'
                WHEN history.Cnt <= 2 THEN 'Aluminium'
                WHEN history.Cnt = 3 THEN 'Bronze'
                WHEN history.Cnt <= 5 THEN 'Silver'
                WHEN history.Cnt <= 7 THEN 'Gold'
                WHEN history.Cnt <= 9 THEN 'Platinum'
                WHEN history.Cnt >= 10 THEN 'Alexandinium'
            END "rank"
            FROM history
            """)

        results = conn.execute(sql, {'email': email})
        rows = results.all()
        if not rows:
            raise ApiError("User not found")

        return rows[0]['rank']


def list_item(item_list: dict):
    """
    Attempt to insert item 

    :param dict item_list: Content of the form field
    """

    with engine.connect() as conn:

        key = conn.execute(
            text("""
            SELECT setval(pg_get_serial_sequence('"Item"', 'item_no'), max(item_no)) FROM "Item";
            """))

        result = conn.execute(
            text(
                """
            INSERT INTO "Item" (condition, title, description, owner_email,  game_type, num_cards)
            VALUES(:condition, :title, :description, :owner_email, :game_type, :num_cards)
            RETURNING item_no;
            """, ), {
                    "title": item_list.get("title"),
                    "condition": item_list.get("condition"),
                    "description": item_list.get("description"),
                    "owner_email": item_list.get("owner_email"),
                    "game_type": item_list.get("game_type"),
                    "num_cards": item_list.get("num_cards") or None
                })
        rows = result.all()

        if result.rowcount:
            return rows[0]['item_no']
        else:
            raise FormError(
                form="Unable to list item because an unexpected error occurred"
            )
        return rows[0]['item_no']


def list_game_platform(item_list: dict):
    """
    Attempt to insert item 

    :param dict item_list: Content of the form field
    """
    with engine.connect() as conn:

        result = conn.execute(
            text(
                """
            INSERT INTO "Game_Platform" (platform_name, game_type, item_no, media)
            VALUES(:platform_name, :game_type, :item_no, :media)
            RETURNING Item_No;
            """, ), {
                    "platform_name": item_list.get("platform"),
                    "item_no": item_list.get("item_no"),
                    "media": item_list.get("media"),
                    "game_type": item_list.get("game_type"),
                })

        if result.rowcount:
            return result.all()
        else:
            raise FormError(
                form="Unable to list item because an unexpected error occurred"
            )
        return result


def Trade_History_Hist(email: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                T.trade_id as "t_id",
                T.proposal_Date AS "p_dt",
                T.transaction_Date AS "t_dt",
                CASE T.trade_Status
                    WHEN TRUE THEN 'Accepted'
                    WHEN FALSE THEN 'Rejected' END AS "status",
                T.transaction_Date::Date - T.Proposal_Date::Date || ' ' || 'Days' AS "res_time",
                CASE WHEN cp_Email = :email then 'Counterparty'
                    WHEN pp_Email = :email then 'Proposer' END AS "role",
                PI.title as "p_item",
                CI.title as "d_item",
                CASE WHEN cp_Email != :email then C.nickname
                    WHEN pp_Email != :email then P.nickname END AS "other_user"

                FROM "Trade" T, "Item" PI, "Item" CI, "User" P, "User" C

                WHERE P.email = PI.owner_Email
                AND PI.item_no = T.proposed_item_no
                AND P.email = T.pp_Email
                AND C.email = CI.owner_Email
                AND CI.item_no = T.desired_item_no
                AND C.email = T.cp_email
                AND (T.cp_email = :email OR T.pp_email = :email)
                ORDER BY T.transaction_date desc, T.proposal_date asc
                """
                ),
                 {"email": email
                })

        rows = result.all()
    return rows


def Trade_History_Sum(email: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    'Proposer' as "role",
                    COUNT(DISTINCT proposed_item_no) as "tot",
                    SUM(CASE WHEN trade_status = true then 1 ELSE 0 END) AS "acptd",
                    SUM(CASE WHEN trade_status = false then 1 ELSE 0 END) AS "rjctd",
                    ROUND(SUM(CASE WHEN trade_status = false then 1 ELSE 0 END)
                            /COUNT(DISTINCT proposed_item_no),0)*100 || '%' AS "rjctd_pct"
                FROM
                    "Trade"
                WHERE
                    "Trade".pp_Email = :email

                UNION ALL

                SELECT
                    'Counterparty' as "My Role",
                    COUNT(DISTINCT Desired_Item_No) as "Total",
                    SUM(CASE WHEN trade_Status = true then 1 ELSE 0 END) AS "Accepted",
                    SUM(CASE WHEN trade_Status = false then 1 ELSE 0 END) AS "Rejected",
                    ROUND(SUM(CASE WHEN trade_status = false then 1 ELSE 0 END)
                            /COUNT(DISTINCT proposed_item_no),0)*100 || '%' AS "Rejected %"
                FROM
                    "Trade"
                WHERE
                    "Trade".cp_Email = :email
                """), {"email": email})

        rows = result.all()
    return rows


def Trade_Details_Other(email:str , tradeId: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                 SELECT
				 		"Trade".trade_id,
                        round(CAST(point(PA.longitude, PA.latitude) <@>
                        (point(CA.longitude, CA.latitude)::point) AS numeric),2) as distance,
                        CASE WHEN "Trade".Pp_Email = :email THEN CU.Nickname
                             WHEN "Trade".Cp_Email = :email THEN PU.Nickname END AS "Nickname",
                    CASE "Trade".trade_status
                        WHEN TRUE THEN
                                (CASE WHEN "Trade".Pp_Email = :email THEN CU.First_Name
                                    WHEN "Trade".Cp_Email = :email THEN PU.First_Name END)
                                ELSE NULL END AS "First_Name",
                            CASE "Trade".trade_status
                        WHEN TRUE THEN
                                (CASE WHEN "Trade".Pp_Email = :email THEN CU.Email
                                    WHEN "Trade".Cp_Email = :email THEN PU.Email END)
                                ELSE NULL END AS "Email"
                FROM
                    "Trade", "User" CU, "User" PU, "PostalAddress"  CA, "PostalAddress" PA
                WHERE
                    ("Trade".Pp_Email = :email OR "Trade".Cp_Email = :email) AND "Trade".trade_id = :tradeId
                    AND "Trade".Pp_Email = PU.Email
                    AND "Trade".Cp_Email = CU.Email
                    AND CU.Postal_Code = CA.Postal_Code
                    AND PU.Postal_Code = PA.Postal_Code
                """
                ),
                 {"email": email, "tradeId": tradeId
                })

        rows = result.all()
    return rows



def Trade_Details_Status(email: str, tradeId: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    T.proposal_Date AS "Proposed_Date",
                    T.transaction_Date AS "Transaction_Date",
                    CASE T.trade_Status
                        WHEN TRUE THEN 'Accepted'
                        WHEN FALSE THEN 'Rejected' END AS "Trade Status",
                    CASE WHEN T.cp_Email = :email then 'Counterparty'
                        WHEN T.pp_Email = :email then 'Proposer' END AS "Role",
                    T.transaction_Date::Date - T.Proposal_Date::Date AS "Response"
                FROM
                    "Trade" T
                WHERE
                    (T.cp_Email = :email OR pp_Email = :email) AND T.trade_id = :tradeId
                """
                ),
                 {"email": email, "tradeId": tradeId
                })

        rows = result.all()
    return rows



def Trade_Details_Pp(tradeId: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    PI.item_No, PI.title, PI.game_type, PI.condition, PI.description
                FROM
                    "Trade" T, "Item" PI
                WHERE
                    T.proposed_item_No = PI.item_No
                    AND T.trade_id = :tradeId
                """
                ),
                 {"tradeId": tradeId
                })

        rows = result.all()
    return rows


def Trade_Details_Cp(tradeId: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    CI.item_No, CI.title, CI.game_type, CI.condition, CI.description
                FROM
                    "Trade" T, "Item" CI
                WHERE
                    T.desired_item_No = CI.item_No
                    AND T.trade_id = :tradeId
                """
                ),
                 {"tradeId": tradeId
                })

        rows = result.all()
    return rows


#ADDED ALL THESE PLACEHOLDERS BUT MAYBE CAN JUST HAVE ONE QUERY THAT DOES EVERYTHING AND WE ELIMINATE INFO WE DONT NEED TO USE
def get_item_info(item: dict):
    """
    Retrieve information for an item that's participating in an unaccepted trade
    """
    with engine.connect() as conn:
        # query items that have not
        result = conn.execute(
            text("""
            SELECT Item.item_no, title, substring(description for 100) as description, condition, owner_email, game_type, GP.platform_name, GP.media, GP.num_cards
            FROM "Item"
            INNER JOIN "Game_Platform" AS GP ON "Item".Item_No = GP.Item_No
            INNER JOIN "Trade" ON "Item".Item_No = "Trade".Desired_Item_No
            WHERE "Item".item_No = :ItemNo AND transaction_date is NULL

            UNION ALL

            SELECT "Item".item_No, title, substring(description for 100) as description, condition, owner_email, game_type, GP.platform_name, GP.media, GP.num_cards
            FROM "Item"
            INNER JOIN "Game_Platform" AS GP ON "Item".Item_No = GP.Item_No
            INNER JOIN "Trade" ON "Item".Item_No = "Trade".Proposed_Item_No
            WHERE "Item".item_No = :ItemNo AND transaction_date is NULL
            """), {"ItemNo": item_no})

        rows = result.all()
        for row in result:
            print("row thing: ", row)

        if len(rows) >= 1:
            return jsonify({'result': [dict(row) for row in rows]})
        elif len(rows) == 0:
            return {}
        else:
            raise FormError(
                form=
                "Unable to search for items by keyword because an unexpected error occurred"
            )


#ADDED ALL THESE PLACEHOLDERS BUT MAYBE CAN JUST HAVE ONE QUERY THAT DOES EVERYTHING AND WE ELIMINATE INFO WE DONT NEED TO USE
def get_basic_item_info(item_no: dict):
    """
    Search for items

    :param dict search: Return results of a search
    """

    with engine.connect() as conn:
        # query items that have not
        result = conn.execute(
            text("""
            SELECT i.item_no, i.title, i.description, i.condition, i.owner_email, i.game_type, GP.platform_name, GP.media, i.num_cards
            FROM "Item" i
            LEFT JOIN "Game_Platform" AS GP ON i.item_no = GP.item_no
            WHERE i.item_No = :ItemNo
            """), {"ItemNo": item_no})

        rows = result.all()

        if len(rows) == 0:
            return None

        return dict(rows[0]._mapping)


def get_item_owner_full_name(item: dict):
    """
    Search for items

    :param dict search: Return results of a search
    """

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT First_Name  || ‘ ‘ || SUBSTRING(Last_name, 1, 1)  || ‘.’
            FROM "Item", "User"
            WHERE "Item".Owner_email = "User".Email
            AND Item_No = :ItemNo;
            """), {"ItemNo": item.get("item_no")})

        rows = result.all()
        for row in result:
            print("row thing: ", row)

        if len(rows) >= 1:
            return jsonify({'result': [dict(row) for row in rows]})
        elif len(rows) == 0:
            return {}
        else:
            raise FormError(
                form=
                "Unable to search for items by keyword because an unexpected error occurred"
            )


def get_item_owner_response_rate(item: dict):
    """
    Search for items

    :param dict search: Return results of a search
    """

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT Proposal_Date, Transaction_Date 
            FROM "Trade" 
            WHERE Cp_Email=:ItemOwnerEmail AND (Trade_Status=False OR Trade_Status=True);
            """), {"ItemOwnerEmail": item.get("ownerEmail")})

        rows = result.all()
        for row in result:
            print("row thing: ", row)

        if len(rows) >= 1:
            return jsonify({'result': [dict(row) for row in rows]})
        elif len(rows) == 0:
            return {}
        else:
            raise FormError(
                form=
                "Unable to search for items by keyword because an unexpected error occurred"
            )


def get_item_owner_proposed_trades_count(item: dict):
    """
    Search for items

    :param dict search: Return results of a search
    """

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT Cp_Email, COUNT(*)
            FROM "Trade"
            WHERE Cp_Email = :Email AND trade_status IS NULL;
            """), {"Email": item.get("ownerEmail")})

        rows = result.all()
        for row in result:
            print("row thing: ", row)

        if len(rows) >= 1:
            return jsonify({'result': [dict(row) for row in rows]})
        elif len(rows) == 0:
            return {}
        else:
            raise FormError(
                form=
                "Unable to search for items by keyword because an unexpected error occurred"
            )


def get_user_relative_distance(user_email, other_user_email):
    with engine.connect() as conn:
        sql0 = text("""
            SELECT u.postal_code
            FROM "User" u
            WHERE u.email = :email
            """)

        rows = conn.execute(sql0, {"email": other_user_email}).all()

        if not len(rows):
            raise ApiError(f"User {user_email} does not exist")

        sql1 = text("""
            SELECT pa.latitude, pa.longitude
            FROM "User" u JOIN "PostalAddress" pa
            ON u.postal_code = pa.postal_code
            WHERE u.email = :email 
            AND u.postal_code != :postal_code
            """)

        rows1 = conn.execute(sql1, {
            "email": user_email,
            "postal_code": rows[0]["postal_code"]
        }).all()

        if not len(rows1):
            return None

        print('#######-----#####')
        print(rows1[0])
        print('#######-----#####')

        sql = text("""
            SELECT round(CAST(point(:longitude, :latitude) <@> point(pa.longitude, pa.latitude) AS numeric), 2) AS distance
            FROM "User" u JOIN "PostalAddress" pa
            ON u.postal_code = pa.postal_code
            WHERE u.email = :email
            """)

        distance_rows = conn.execute(
            sql, {
                "email": other_user_email,
                "longitude": rows1[0]["longitude"],
                "latitude": rows1[0]["latitude"]
            }).all()

        if not len(distance_rows):
            raise ApiError("Failed to calculate earth distance")

        return distance_rows[0]['distance']


###All these queries could be combined into once basic query similar to how the search grabs all the info at once, then just choose not to display some of it if the current user is the owner of the item


def get_my_items(emailOrNickname: str):
    """
    Get items for logged in user

    :param str emailOrNickname: email or nickname of user to query on
    """

    with engine.connect() as conn:
        result = conn.execute(
            text(
            """
            SELECT Item_No as "item_no", Game_type as "game_type", Title as "title", Condition as "condition", CASE WHEN LENGTH(substring(description for 100)) >= 100 THEN substring(description for 100) || '...' ELSE substring(description for 100) END as "description"
            FROM "Item"
            WHERE "Item".Item_no NOT IN 
            (
                SELECT Desired_Item_no AS Item
                FROM "Trade"
                WHERE "Trade".Cp_email = :email
                    AND "Trade".Trade_status IS True

                UNION 

                SELECT Proposed_Item_no AS Item
                FROM "Trade"
                WHERE "Trade".Pp_email = :email
                    AND "Trade".Trade_status IS True
            ) AND "Item".owner_email = :email;
            """), {"email": emailOrNickname})

        rows = result.all()
        for row in result:
            print("row thing: ", row)

        return rows


def get_items_count(emailOrNickname: str):
    """
    Get count of items for logged in user

    :param str emailOrNickname: email or nickname of user to query on
    """

    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT COUNT(item_no) as "total",
            SUM(CASE WHEN game_type = 'Board Game' then 1 else 0 end) as "boardGame",
            SUM(CASE WHEN game_type = 'Playing Card Game' then 1 else 0 end) as "playingCardGame",
            SUM(CASE WHEN game_type = 'Collectible Card Game' then 1 else 0 end) as "collectibleCardGame",
            SUM(CASE WHEN game_type = 'Video Game' then 1 else 0 end) as "videoGame",
            SUM(CASE WHEN game_type = 'Computer Game' then 1 else 0 end) as "computerGame"
            FROM "Item"
            WHERE owner_Email = :email
            """), {"email": emailOrNickname})

        rows = result.all()
        for row in result:
            print("row thing: ", row)
        return rows

def get_allow_list(emailOrNickname: str):
        
    """
    Get count of of unaccepted trades 

    :param str emailOrNickname: email or nickname of user to query on
    """

    with engine.connect() as conn:
        result = conn.execute(
            text(
            """
            SELECT COUNT(*) as "count"
            FROM "Trade"
            WHERE Cp_Email = :email AND transaction_date IS NULL;
            """),
            {
                    "email": emailOrNickname
            })
            
        rows = result.all()
        for row in result:
            print("row thing: ", row)
        return rows[0]['count']

def confirm_trade(desired_item_no, cp_email, proposed_item_no,
                  pp_email) -> bool:
    with engine.connect() as conn:
        conn.execute(
            text("""
                insert into "Trade" (proposal_date, pp_email, cp_email, proposed_item_no, desired_item_no, trade_status)
                values (:proposal_date, :pp_email, :cp_email, :proposed_item_no, :desired_item_no, false)
                """), {
                "proposal_date": date.today().strftime("%Y-%m-%d"),
                "pp_email": pp_email,
                "cp_email": cp_email,
                "proposed_item_no": proposed_item_no,
                "desired_item_no": desired_item_no
            })


        return True


def get_item_owner(item_no: int) -> str:
    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT email
            FROM "Item" i JOIN "User" u
            ON i.owner_email = u.email
            AND item_no = :item_no;
            """), {"item_no": item_no})

        rows = result.all()

        if len(rows) > 1:
            raise ApiError(
                f"Expected one email address associated with item {item_no}")
        elif len(rows) == 0:
            raise ApiError(f"Item with number {item_no} exists")

        return rows[0]["email"]
