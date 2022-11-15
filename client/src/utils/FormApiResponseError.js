export default class FormApiResponseError extends Error {
  constructor(errors, formName) {
    super(`Form ${formName || ' '}submission failed`);
    this.errors = errors;
    this.name = 'FormApiResponseError'
  }
}
