import {useSelector} from "react-redux";
import {provisionedFields} from "./fieldsSlice";

function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}



function makeRequest(url, method, data=null){

    const csrftoken = getCookie('csrftoken');
    return fetch(url,{
            method: method,
            headers: {'X-CSRFToken': csrftoken, 'Content-Type': 'application/json'},
            mode: 'same-origin', // Do not send CSRF token to another domain.
            body: JSON.stringify(data)
        }
    )
}



export function saveForm(fields, formId) {
        // todo, make this approximately a million times better with bulk updates.
        // Also, we need confirmation for when the request happens.
        fields.forEach((fieldObj) =>{
            fieldObj = {... fieldObj, id:fieldObj.djangoId, form: formId}
            if(fieldObj.isDeleted && fieldObj.djangoId){
                let url = "/formulaic/api/" + fieldObj.model_class + "s/" + fieldObj.djangoId + "/"
                makeRequest(url, "DELETE", fieldObj)
            }
            else if(fieldObj.djangoId){
                let url = "/formulaic/api/" + fieldObj.model_class + "s/" + fieldObj.djangoId + "/"
                makeRequest(url, "PUT", fieldObj)
            }else{
                let url = "/formulaic/api/" + fieldObj.model_class + "s/"
                makeRequest(url, "POST", fieldObj)
            }
        })
    }




// A mock function to mimic making an async request for data
export function fetchCount(amount = 1) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ data: amount }), 500)
  );
}
