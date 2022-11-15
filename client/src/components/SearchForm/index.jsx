import { ErrorMessage, Field, Form as FormikForm, Formik } from "formik";
import React from "react";
import { Block, Heading, Button, Form, Columns } from "react-bulma-components";
import { Link, useNavigate } from "react-router-dom";
import BasicInput from "../utils/form/inputs/BasicInput";
import api from "../../utils/api";
import logger from "../../utils/logger";
import { useState } from "react";
import { SearchTable } from "../../containers/Search";

export default function SearchForm() {
  const navigate = useNavigate();
  var arethereerrors = false
  const [ searchType, setSearchType ] = useState()
  const [ searchResults, setSearchResults ] = useState()

  if (searchResults) {
    return  <SearchTable results={searchResults} type={searchType}/>
  }
    
  return (
   <Block>
      <Formik
        initialValues={{ keyword: "", myPostalCode: "", withinRadius: "", withinPostalCode: "" }}
        validate={validateForm()}
        onSubmit={submitSearch(navigate, setSearchResults, setSearchType)}
      >

      {({ isSubmitting, errors, touched, values, setErrors}) => (
          <FormikForm>

            <Heading>Search</Heading>
              <Field
                as={Form.Radio}
                name="searchOptions"
                value="key"
              >By Keyword
                <Field type="text" name="keyword"/>
              </Field>

              <Field
                as={Form.Radio}
                name="searchOptions"
                value="mypostalcodeval"
              >
                My Postal Code
              </Field>

              <Field
                  name="searchOptions"
                  value="withinRad"
                  as={Form.Radio}
              >
                Within <Field type="number" min="1" name="withinRadius"/> Miles of Me
              </Field>

              <Field
                  name="searchOptions"
                  value="postal"
                  as={Form.Radio}
              >
                In Postal Code <Field type="number" name="withinPostalCode" />
              </Field>

              <ErrorMessage
                name="keyword"
                component={Form.Help}
                color="danger"
              />

            <Columns vCentered>
              <Columns.Column>
                <button onClick={submitSearch}>
                  Search!
                </button>
              </Columns.Column>

              <Columns.Column size={3}>
                <Link to="/mainmenu">Main Menu</Link>
              </Columns.Column>

            </Columns>
          </FormikForm>
        )}
      </Formik>
    </Block>
  );
}

function validateForm(explicitError) {
  return ({ keyword, myPostalCode, withinRadius, withinPostalCode }) => {
    const errors = {};
    SearchForm.arethereerrors = false
    if(explicitError == "Sorry, No Results Found!") {
      logger.debug("want to say o res found")
      errors.keyword = explicitError;
      SearchForm.arethereerrors = true;
    } else {
      logger.debug("running validator")
      if (!(keyword || myPostalCode || withinRadius || withinPostalCode )) {
        logger.debug("nothing sleected")
      } else {
        let counter = 0
        if (keyword) { counter++ }
        if (myPostalCode) { counter++ }
        if (withinRadius) { counter++ }
        if (withinPostalCode) { counter++ }
        if (counter > 1) {
          errors.keyword = "Please select only one field";
          SearchForm.arethereerrors = true
        }
      }
    }
    logger.debug("errors: ", {errors})
    return errors;
  };
  
}

function submitSearch(navigate, setSearchResults, setSearchType) {

  validateForm();
  if (!SearchForm.arethereerrors) { //dont do the search if we have no fields or have more than 1 filled in
    return ({ keyword, myPostalCode, withinRadius, withinPostalCode, searchOptions}, actions ) => {
      console.log({searchOptions})
      if (searchOptions == 'mypostalcodeval') { myPostalCode = "anything" }
      api
        .search({keyword, myPostalCode, withinRadius, withinPostalCode})
        .then((searchResponse) => {
          // actions.setSubmitting(false);
          if (Object.keys(searchResponse).length > 0) {
            logger.debug("search successful, navigating to search table");
            logger.debug("response in index.js: ", searchResponse)
              SearchForm.arethereerrors = false
              if (keyword) { setSearchType({"header": `Items and Descriptions with Keyword: ${keyword}`})}
              else if (myPostalCode) { setSearchType({"header": 'Items In My Postal Code'})}
              else if (withinRadius) { setSearchType({"header": `Items Within a Radius of ${withinRadius} Miles`})}
              else if (withinPostalCode) { setSearchType({"header": `Items Within A Specific Postal Code: ${withinPostalCode}`})}
              setSearchResults(searchResponse)
              return
          } else {
            logger.debug("bad things no results")
            actions.setErrors({"keyword":"Sorry No Results found!"})
            // validateForm("Sorry, No Results Found!")
            return "Sorry No Results found!"
          }
        })
        .catch((err) => {
          logger.error("Failed to search because an unexpected error occurred", err);
        });
    };
  } else {
    return;
  }
}

