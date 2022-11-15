import json
from pprint import pprint

from flask import Flask, request, make_response, abort, session, redirect, url_for, jsonify
from flask_cors import CORS


from api.util import ApiError, FormError, authenticated, unauthenticated
import api.services.user as userService
import api.services.search as searchService
from api.validator import validate_login_form
from api.repos import data_access
import api.services.list_item as listItem

# Initialize flask
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Not important that this value is a secret for this project
app.secret_key = 'Z+BD1T3LwiU='

@app.route("/")
def hello_world():
    return '<p>Hello, World!<p>'

@app.route("/login", methods=["POST"])
@unauthenticated
def login():
    app.logger.info("Logging in User")

    try:
        raw_login_form = request.json
        login = validate_login_form(raw_login_form)
    except FormError as err:
        app.logger.error(f'Failed to login user {err.messages}')
        return make_response(jsonify(err.messages), 400)
    except Exception as exception:
        app.logger.error(f'Exception occurred during form validation', e)
        return make_response(jsonify({ "form": "An unexpected error occurred" }), 500)

    try:
        user = userService.login(login)
        session['email'] = user.email
        session['postalCode'] = user.postal_code
        session.modified = True

        app.logger.info("Successfully logged-in User")
        
        return { "email": user.email, "postalCode": user.postal_code }

    except FormError as fe:
        app.logger.error("Failed to login User:: %s", fe.messages)
        return make_response(jsonify(fe.messages), 400)
    except Exception as e:
        app.logger.error(f'Failed to login because an unexpected error occurred {e}')
        return make_response(jsonify({ "form": "An unexpected error occurred while logging in" }), 500)

@app.route("/logout")
@authenticated
def logout():
    session.clear()
    return { "status": "ok"}

@app.route("/register", methods=["POST"])
@unauthenticated
def register():
    app.logger.info("Registering User")

    try:
        raw_register_form = request.json
        my_user = userService.register(raw_register_form)
        app.logger.info("Successfully registered User")

        email = raw_register_form.get('email').strip()
        session['email'] = email
        session['postalCode'] = raw_register_form.get('postalCode').strip()
        session.modified = True

        return { "email": email }
    except FormError as fe:
        app.logger.error("Failed to register User:: %s", fe.messages)
        return make_response(jsonify(fe.messages), 400)
    except Exception as e:
        app.logger.error("Failed to registered User because an unknown error occurred", e)
        return make_response(jsonify({ "form": "An unexpected error occurred while registering" }), 500)

@app.route("/search", methods=["POST"])
def search():
    app.logger.info("searching for items")

    try:
        raw_search_form = request.json
        # app.logger.info(json.dumps(raw_search_form), "from server py")

        raw_search_form['email'] = session['email']
        # app.logger.info(raw_search_form['keyword'])
        my_search = {}
        
        # Depending on what we need to search for, send a diff request
        if raw_search_form['keyword'] : 
            raw_search_form['userPostalCode'] = session['postalCode']
            my_search = searchService.keyword_search(raw_search_form)
        elif raw_search_form['withinRadius'] : 
            raw_search_form['userPostalCode'] = session['postalCode']
            my_search = searchService.radius_search(raw_search_form)
        elif raw_search_form['withinPostalCode']: 
            my_search = searchService.within_postal_code_search(raw_search_form)
        elif raw_search_form['myPostalCode']:
            raw_search_form['withinPostalCode'] = session['postalCode']
            # print(raw_search_form['postalCode'], "being sent in")
            my_search = searchService.within_postal_code_search(raw_search_form)
        else:
            app.logger.error("Failed to search for items because no params sent in")


        # y = json.loads(my_search)       
        app.logger.info(my_search)
        app.logger.info("Successfully searched for items")
        app.logger.info("end of server stuff+++++++++++++++++++++")

        return my_search
    except FormError as fe:
        app.logger.error("Failed to search items:: %s", fe.messages)
        return make_response(jsonify(fe.messages), 400)
    except Exception as e:
        app.logger.error("Failed to search for items because an unknown error occurred", e)
        return make_response(jsonify({ "form": "An unexpected error occurred while searching" }), 500)

@app.route("/profile")
@authenticated
def profile():
    app.logger.debug("Retrieving user profile")
    try:
        user = data_access.get_user_profile(session["email"])
        app.logger.info("successfully retrieved user profile")
        return user
    except ApiError as apiError:
        app.logger.warn("Unable to retrieve user because they do not exist")
        return make_response(jsonify(apiError), 404)
    except Exception as e:
        app.logger.error("Unable to retrieve user because they do not exist", e)
        return make_response(jsonify({ "error": "An unexpected error occurred"}), 500)

@app.route("/menu/stats")
@authenticated
def menu_stats():
    app.logger.debug("Retrieving menu stats")
    email = session["email"]
    try:
        unaccepted_trades = data_access.get_unaccepted_trades(email)
        app.logger.info("successfully retrieved unaccepted trades")
        
        avg_response_time = data_access.get_average_trade_response_time(email)
        app.logger.info("successfully retrieved average trade response time")

        rank = data_access.get_completed_trades(email)
        app.logger.info("successfully retrieved trade rank")

        return { "unaccepted_trades": unaccepted_trades, "avg_response_time": avg_response_time, "rank": rank }
    except ApiError as apiError:
        app.logger.warn("Unable to retrieve user because they do not exist")
        return make_response(jsonify(apiError), 404)
    except Exception as e:
        app.logger.error("Unable to retrieve user because they do not exist", e)
        return make_response(jsonify({ "error": "An unexpected error occurred"}), 500)

@app.route("/items/list", methods=["POST"])
@authenticated
def list_item(): 
    app.logger.info("Retrieving my items")

    try:
        raw_list_form = request.json
        raw_list_form['owner_email'] = session["email"]
        email = session['email']
        
        count = data_access.get_allow_list(email)
        app.logger.debug(count)
        if (count >= 2):
            return {"itemId": None, "count": count}

        itemsList = listItem.list_item(raw_list_form)
        app.logger.info("Successfully listed item")
        raw_list_form['item_no'] = itemsList
        if raw_list_form['game_type'] == 'Computer Game' or raw_list_form['game_type'] == 'Video Game':
            if raw_list_form['game_type'] == 'Computer Game':
                raw_list_form['media'] = None
            listItem.list_platform(raw_list_form)
        
        count = data_access.get_allow_list(email)

        return {"itemId": itemsList, "count": count}
    except FormError as fe:
        app.logger.error("Failed to list Item:: %s", fe.messages)
        return make_response(jsonify(fe.messages), 400)
    except Exception as e:
        app.logger.error("Failed to listItem because an unknown error occurred", e)
        return make_response(jsonify({ "form": "Please fill in all fields." }), 500)

@app.route("/items")
@authenticated
def my_items(): 
    app.logger.info("Retrieving my items")

    try:
        email = session['email']
        result_items = data_access.get_my_items(email)
        result_count = data_access.get_items_count(email)



        return make_response(jsonify({ 
            "result_count": [dict(row) for row in result_count],
            "result_items" : [dict(row) for row in result_items]
            }))
    except Exception as e:
        app.logger.error("Failed to get myItems because an unknown error occurred", e)
        return make_response(jsonify({ "form": "An unexpected error occurred while retrieving my items" }), 500)

@app.route("/TradeHistory", methods=["GET"])
@authenticated
def TradeHistory():
        email = session['email']
        result_hist = data_access.Trade_History_Hist(email)
        result_sum = data_access.Trade_History_Sum(email)
        return make_response(jsonify({ 
            "result_hist": [dict(row) for row in result_hist],
            "result" : [dict(row) for row in result_sum]
            }))
    
@app.route("/trades/<tradeId>", methods=["GET"])
@authenticated
def TradeDetails(tradeId):
        trade_id = tradeId
        email = session['email']

        result_other = data_access.Trade_Details_Other(email, trade_id)
        result_status = data_access.Trade_Details_Status(email, trade_id)
        result_pp = data_access.Trade_Details_Pp(trade_id)
        result_cp = data_access.Trade_Details_Cp(trade_id)
        return make_response(jsonify({ 
            "result_other": [dict(row) for row in result_other], 
            "result_status": [dict(row) for row in result_status],
            "result_pp": [dict(row) for row in result_pp],
            "result_cp": [dict(row) for row in result_cp]
            }))

@app.route("/items/<raw_item_no>", methods=["GET"])
@authenticated
def view_item(raw_item_no):
    item_no = int(raw_item_no)
    app.logger.debug("Retrieving item details for item_no=%s", item_no)
    try:
        # retrieve information for a tradeable item
        item_info = data_access.get_basic_item_info(item_no)

        # item not found
        if not item_info:
            return make_response(jsonify({ "message": "User not found"}), 404)

        # Check whether the item belongs to some other user
        owner_email = item_info.get("owner_email")
        if session["email"] != owner_email:
            # This is the counterparty so retrieve their info relative to the current user
            email = session["email"]
            item_info['distance'] = data_access.get_user_relative_distance(email, owner_email)

            item_info['other_user_profile'] = data_access.get_user_profile(owner_email)

            item_info['can_respond_to_trade'] = data_access.can_respond_to_trade_request(email)

            item_info['item_is_available'] = data_access.is_item_available(item_no)

            item_info['avg_response_time'] = data_access.get_average_trade_response_time(owner_email)

            item_info['rank'] = data_access.get_completed_trades(owner_email)

        return item_info
    except ApiError as ae:
        app.logger.debug('Item %s does not exist', item_no, e)
        return make_response(jsonify(ae), 400)
    except Exception as e:
        app.logger.error('Failed to retrieve item info', e)
        return make_response(jsonify(e), 500)


@app.route('/items/<desired_item_no>/trade/<proposed_item_no>', methods=["POST"])
@authenticated
def confirm_trade(desired_item_no, proposed_item_no):
    try:
        d_item_no = int(desired_item_no)
        p_item_no = int(proposed_item_no)
        pp_email = session["email"]

        cp_email = data_access.get_item_owner(d_item_no)
        is_successful = data_access.confirm_trade(d_item_no, cp_email, p_item_no, pp_email)
        if is_successful:
            return {"result": "success"}
        else:
            return make_response(jsonify({ "result": "request failed"}), 400)
    except Exception as e:
        app.logger.error('Failed to retrieve item info', e)
        return make_response(jsonify(e), 500)
