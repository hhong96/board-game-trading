import { Form as FormikForm, Formik, Field, ErrorMessage } from "formik";
import BasicInput from "../utils/form/inputs/BasicInput";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import logger from "../../utils/logger";
import { useState } from "react";
import { Block, Heading, Columns, Button, Icon, Form, Message, MessageBody} from "react-bulma-components";
import { SuccessMessageObject } from "../../containers/ListItem";



const initialFormValues = {
    title: "",
    condition: "",
    description: "",
    game_type: "", 
    num_cards: "", 
    platform: "", 
    media: ""
  };

var isAllowed = false; 

function ListItem() {
  const [ successMessage, setSuccessMessage] = useState()
  const [errorMessage, setErrorMessage] = useState()

  const navigate = useNavigate();
  if(successMessage){
    logger.info("succes!")
    return <SuccessMessageObject message={successMessage}/>
  }

  if(errorMessage){
    logger.info("you can't!")
    return <SuccessMessageObject message={errorMessage}/>
  }
  return (
    <Block>
      <Formik
        initialValues={initialFormValues}
        // validate={validateForm()}
        onSubmit={onSubmit(navigate, setSuccessMessage, setErrorMessage)}
        
      >{({ isSubmitting, errors, touched, values, setErrors }) => 
        
        {
          let subGameTypeComponent = null 
          let videoGameMedia = null
          let collectibleCardNum = null 
          console.log(values)
          if(values.game_type === "Computer Game"){

            subGameTypeComponent = <Field
              as={Form.Select}
              color=""
              icon={<Icon><i aria-hidden="true" className="fas fa-angle-down"/></Icon>}
              label="Computer game platform"
              name="platform"

            >
              <option value="">
                Select platform
              </option>
              <option value="macOS">
                macOS
              </option>

              <option value="Linux">
                Linux
              </option>

              <option value="Windows">
                Windows
              </option>
            </Field>
          }
          
          if(values.game_type === "Video Game"){

            subGameTypeComponent = <Field
              as={Form.Select}
              color=""
              icon={<Icon><i aria-hidden="true" className="fas fa-angle-down"/></Icon>}
              label="Video game platform"
              name="platform"
            >
              <option value="">
                Select platform
              </option>
              <option value="Nintendo">
                Nintendo
              </option>

              <option value="PlayStation">
                PlayStation
              </option>

              <option value="Xbox">
                Xbox
              </option>
            </Field> 
            
          } 

          if(values.game_type === "Video Game"){

            videoGameMedia = <Field
              as={Form.Select}
              color=""
              icon={<Icon><i aria-hidden="true" className="fas fa-angle-down"/></Icon>}
              label="Video game media"
              name="media"
            >
              <option value="">
                Select media
              </option>
              <option value="Optical disc">
                Optical disc
              </option>

              <option value="Cartridge">
                Cartridge
              </option>

              <option value="Game card">
                Game card
              </option>
            </Field> 
            
          } 

          if(values.game_type === "Collectible Card Game"){

            videoGameMedia = <Field
            type="text"
            name="num_cards"
            as={BasicInput}
            label="Number of cards"
            disabled={isSubmitting}
            iconClass="fa-user"
            inErrorState={
              !!(errors.num_cards && touched.num_cards)
            }
          />
          } 
          
          return (
         <FormikForm>

            <Heading>List Item</Heading>

            
            <Field
              as={Form.Select}
              color=""
              icon={<Icon><i aria-hidden="true" className="fas fa-angle-down"/></Icon>}
              label="Condition"
              name="condition"
            >
              <option value="">
                Select condition
              </option>
              <option value="Unopened">
                Unopened
              </option>

              <option value="Like New">
                Like New
              </option>

              <option value="Lightly Used">
                Lightly Used
              </option>

              <option value="Moderately Used">
                Moderately Used
              </option>

              <option value="Heavily Used">
                Heavily Used
              </option>

              <option value="Damaged/Missing parts">
                Damaged/Missing parts
              </option>
            </Field>

            <Field
              as={Form.Select}
              color=""
              icon={<Icon><i aria-hidden="true" className="fas fa-angle-down"/></Icon>}
              label="Game Type"
              name="game_type"
            >
              <option value="">
                Select game type
              </option>
              <option value="Board Game">
                Board Game
              </option>

              <option value="Playing Card Game">
                Playing Card Game
              </option>

              <option value="Collectible Card Game">
                Collectible Card Game
              </option>

              <option value="Video Game">
                Video Game
              </option>

              <option value="Computer Game">
                Computer Game
              </option>
            </Field>

            <Field
              type="text"
              name="title"
              as={BasicInput}
              label="Title"
              disabled={isSubmitting}
              iconClass="fa-user"
              inErrorState={
                !!(errors.title && touched.title)
              }
            />
            <ErrorMessage
              name="title"
              component={Form.Help}
              color="danger"
            />
            <Field
              type="text"
              name="description"
              as={BasicInput}
              label="Description"
              disabled={isSubmitting}
              iconClass="fa-user"
              inErrorState={
                !!(errors.description && touched.description)
              }
            />
            <ErrorMessage
              name="description"
              component={Form.Help}
              color="danger"
            />
            {subGameTypeComponent}
            {videoGameMedia}
            {collectibleCardNum}

            <ErrorMessage
                name="items_list"
                component={Form.Help}
                color="danger"
              />
            <Columns vCentered>
              <Columns.Column>
                <button color="" onClick={onSubmit}>
                  List Item
                </button>
              </Columns.Column>
              <Columns.Column size={3}>
              </Columns.Column>
            </Columns>

        </FormikForm>
      )}}</Formik>
    </Block>
  );
}

// function validateForm(count) {
//   const errors = {}
//   if (count >= 2){
//     errors.count = "You cannot list an item at this time"
//     ListItem.isAllowed = true; 
//   }
//   return errors

// }



function onSubmit(navigate, setSuccessMessage, setErrorMessage) {
  return ({ title, condition, description, game_type, num_cards, platform, media }, actions) => {
    // actions.setSubmitting(true);
    const errors = {}
    api
      .listItems({ title, condition, description, game_type, num_cards, platform, media})
      .then((listItemResponse) => {
        // actions.setSubmitting(false);
        logger.debug(listItemResponse)
        if(listItemResponse.count >= 2){
            setErrorMessage("You cannot list an item at this time. ")
            return 
        } else {
          logger.debug("Item listed successfully");
          setSuccessMessage("Your item has been listed! Your item number is " + listItemResponse.itemId)
          return
        } 
        
      })
      .catch((err) => {
        actions.setSubmitting(false);
        if (err.errors && err.errors.form) {
          actions.setFieldError("title", err.errors.form);
        } else if (err && err.errors) {
          actions.setErrors(err.errors);
        } else {
          logger.error("Failed to list item because an unexpected error occurred", err);
        }
      });
  };
}
  
export default ListItem;
