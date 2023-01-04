class Model {
  constructor() { }

  // CREATE
  async addContact(formInfo) {
    try {
      let init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: formInfo,
      }
      let response = await fetch('http://localhost:3000/api/contacts/', init)
      if (response.ok) {
        alert('Contact was successfully added.');
        this.onContactListChanged();
      } else {
        alert(`Could not add contact due to: ${response.statusText}`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  convertTagsToArray(contacts) {
    contacts.forEach(contact => {
      if (contact.tags) {
        contact.tags = contact.tags.split(',').map(contact => contact.trim());
      }
    })
  }

  // READ
  async getContacts() {
    try {
      let response = await fetch('/api/contacts');
      if (response.ok) {
        let contacts = await response.json();
        this.convertTagsToArray(contacts);
        return contacts;
      } else {
        alert('An error occurred while attempting to retrieve your contact list.')
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  // READ 
  async getContact(id) {
    try {
      let response = await fetch(`/api/contacts/${id}`);
      if (response.ok) {
        let contact = await response.json();
        return contact;
      } else {
        alert(`An error occurred while attempting to retrieve contact ${id}.`)
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  // UPDATE
  async editContact(id, formInfo) {
    try {
      let init = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: formInfo,
      }
      let response = await fetch(`/api/contacts/${id}`, init);
      if (response.ok) {
        alert(`Contact ${id} has been successfully edited.`);
        this.onContactListChanged();
      } else {
        alert(`There was an error with your request to edit contact ${id}.`)
      }
    } catch (error) {
      console.log(error);
    }
  }

  // DELETE
  async deleteContact(id) {
    try {
      let init = {
        method: 'DELETE',
        body: id,
      }
      let response = await fetch(`/api/contacts/${id}`, init);
      if (response.ok) {
        alert(`Contact ${id} has been successfully deleted.`);
        this.onContactListChanged();
      } else {
        alert(`There was an error with your request to delete contact ${id}`)
      }
    } catch (error) {
      console.log(error);
    }
  }

  // FILTER
  async filterByTag(queryTag) {
    let filteredContacts = [];
    let contacts = await this.getContacts();
    for (let i = 0; i < contacts.length; i++) {
      let tags = (contacts[i].tags);
      for (let j = 0; j < tags.length; j++) {
        if (tags[j].toLowerCase() === queryTag.toLowerCase()) {
          filteredContacts.push(contacts[i]);
        }
      }
    }
    return filteredContacts;
  }

  // FILTER
  async filterBySearch(query) {
    let contacts = await this.getContacts();
    contacts = contacts.filter(({ full_name }) => full_name.toLowerCase().includes(query.toLowerCase()));
    return contacts;
  }

  bindContactListChanged(callback) {
    this.onContactListChanged = callback;
  }
}

class View {
  constructor() {
    // DOM Elements
    this.form = document.querySelector('#contact_form');
    this.formTitle = document.querySelector('#form_title');
    this.$form = $('#contact_form'); // for jquery convenience methods
    this.data = new FormData(this.form);
    this.submit = document.querySelector('#submit');
    this.cancel = document.querySelector('#cancel');
    this.contacts = document.querySelector('#contacts');
    this.$contacts = $('#contacts');
    this.noContactsMsg = $('#no_contacts_msg');
    this.searchBar = document.querySelector('#search_bar');
    this.allContacts = document.querySelector('#all_contacts');
    this.id;
    // FORM
    this.fullName = document.querySelector('#full_name');       // FULL NAME
    this.email = document.querySelector('#email');               // EMAIL
    this.phoneNumber = document.querySelector('#phone_number'); // PHONE NUMBER
    this.tags = document.querySelector('#tags');                 // TAGS
    // FORM ERRORS
    this.fullNameError = document.querySelector('#full_name_error');        // FULL NAME
    this.emailError = document.querySelector('#email_error');               // EMAIL
    this.phoneNumberError = document.querySelector('#phone_number_error');  // PHONE NUMBER
    this.formErrors = document.querySelector('#form_errors');
    // Handlebars
    this.templates = this.createTemplates();
    this.registerPartialsAndHelpers();
  }

  createTemplates() {
    let contactListHtml = document.getElementById('contact_list_template').innerHTML;
    return {
      contactListTemplate: Handlebars.compile(contactListHtml),
    }
  }

  registerPartialsAndHelpers() {
    let contactHtml = document.getElementById('contact_template').innerHTML;
    Handlebars.registerPartial('contactTemplate', contactHtml);
  }

  hideContacts() {
    this.$contacts.hide();
  }

  displayNoContacts() {
    this.noContactsMsg.show();
  }

  hideNoContacts() {
    this.noContactsMsg.hide();
  }

  displayContactForm() {
    this.$form.show();
  }

  hideContactForm() {
    this.$form.hide();
  }

  getFormJSON() {
    let form = new FormData(document.querySelector('#contact_form'));
    let formJSON = JSON.stringify(Object.fromEntries(form));
    return formJSON;
  }

  validateInput(form) {
    let formIsValid = form.checkValidity();
    if (!formIsValid) {
      this.formErrors.textContent = 'Please correct the form error(s) before trying to submit.';
    } else {
      this.clearFormErrors();
    }
    // NAME
    if (this.fullNameValueMissing()) {
      this.fullNameError.textContent = 'Please enter the name field.';
    } else if (this.fullNamePatternMismatch()) {
      this.fullNameError.textContent = 'Please enter name in the correct format.';
    } else {
      this.fullNameError.textContent = '';
    }
    // EMAIL
    if (this.emailMissing()) {
      this.emailError.textContent = 'Please enter the valid email field.';
    } else if (this.emailWrongFormat()) {
      this.emailError.textContent = 'Please an email in the correct format.';
    } else {
      this.emailError.textContent = '';
    }
    // PHONE
    if (this.phoneMissing()) {
      this.phoneNumberError.textContent = 'Please enter the phone field';
    } else if (this.phonePatternMismatch()) {
      this.phoneNumberError.textContent = 'Please enter the phone matching the format ###-###-####';
    } else {
      this.phoneNumberError.textContent = '';
    }
  }

  clearFormErrors() {
    this.formErrors.textContent = '';
    this.fullNameError.textContent = '';
    this.emailError.textContent = '';
    this.phoneNumberError.textContent = '';
  }

  fullNameValueMissing() {
    return this.fullName.validity.valueMissing;
  }
  fullNamePatternMismatch() {
    return this.fullName.validity.patternMismatch;
  }
  emailMissing() {
    return this.email.validity.valueMissing;
  }
  emailWrongFormat() {
    return this.email.validity.typeMismatch || this.email.validity.patternMismatch;
  }
  phoneMissing() {
    return this.phoneNumber.validity.valueMissing;
  }
  phonePatternMismatch() {
    return this.phoneNumber.validity.patternMismatch;
  }

  displayContacts(contacts) {
    this.contacts.innerHTML = this.templates.contactListTemplate({ contacts });
    console.log
  }

  populateEditForm(contact) {
    this.formTitle.textContent = 'Edit Contact';
    let { full_name, phone_number, email, tags } = contact;
    this.fullName.value = full_name;
    this.email.value = email;
    this.phoneNumber.value = phone_number;
    this.tags.value = tags;
  }

  bindSubmit(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault();
      handler(this.id);
    })
  }

  bindEdit(handler) {
    this.contacts.addEventListener('click', event => {
      if (event.target.classList.contains('edit')) {
        this.id = Number(event.target.parentElement.dataset.id);
        handler(this.id);
      }
    })
  }

  bindDelete(handler) {
    this.contacts.addEventListener('click', event => {
      if (event.target.classList.contains('delete')) {
        this.id = (Number(event.target.parentElement.dataset.id));
        handler(this.id);
      }
    })
  }

  bindCancel(handler) {
    this.cancel.addEventListener('click', event => {
      handler();
    })
  }

  bindAdd(handler) {
    document.addEventListener('click', event => {
      if (event.target.classList.contains('add')) {
        handler();
      }
    })
  }

  bindSearchBar(handler) {
    this.searchBar.addEventListener('keyup', event => {
      let query = event.target.value;
      handler(query);
    })
  }

  bindAllContacts(handler) {
    this.allContacts.addEventListener('click', event => {
      handler();
    })
  }

  bindTags(handler) {
    this.contacts.addEventListener('click', event => {
      if (event.target.classList.contains('tag')) {
        let tag = event.target.textContent;
        handler(tag);
      }
    })
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindContactListChanged(this.onContactListChanged); // CONTACT LIST CHANGED
    this.view.bindAdd(this.handleAdd);                            // ADD 
    this.view.bindEdit(this.handleEdit);                          // EDIT
    this.view.bindDelete(this.handleDelete);                      // DELETE 
    this.view.bindSubmit(this.handleSubmit);                      // SUBMIT
    this.view.bindCancel(this.handleCancel);                      // CANCEL
    this.view.bindSearchBar(this.handleSearchQuery);              // SEARCH BAR
    this.view.bindAllContacts(this.onContactListChanged)          // ALL CONTACTS
    this.view.bindTags(this.handleTagClick);                      // TAGS

    // Display initial contacts
    this.onContactListChanged();
  }

  onContactListChanged = async () => {
    let contacts = await this.model.getContacts();
    contacts.length === 0 ? this.view.displayNoContacts() : this.view.hideNoContacts();
    this.view.displayContacts(contacts);
    this.view.hideContactForm();
  }

  handleAdd = () => {
    this.view.form.reset();
    this.view.formTitle.textContent = 'Create Contact';
    this.view.displayContactForm();
  }

  handleEdit = async (id) => {
    let contact = await this.model.getContact(id);
    this.view.displayContactForm();
    this.view.populateEditForm(contact);
  }

  handleDelete = (id) => {
    this.model.deleteContact(id);
  }

  handleSubmit = (id) => {
    let form = document.querySelector('#contact_form');
    this.view.validateInput(form);

    let formIsValid = form.checkValidity();
    if (formIsValid) {
      let formTitle = this.view.formTitle.textContent;
      let formJSON = this.view.getFormJSON();
      if (formTitle === 'Edit Contact') {
        this.model.editContact(id, formJSON)
      } else if (formTitle === 'Create Contact') {
        this.model.addContact(formJSON);
      }
    }
  }

  handleCancel = () => {
    this.view.form.reset();
    this.view.clearFormErrors();
    this.view.hideContactForm();
    this.view.formTitle.textContent = 'Create Contact';
  }

  handleSearchQuery = async (query) => {
    let contacts = await this.model.filterBySearch(query);
    this.view.displayContacts(contacts);
  }

  handleTagClick = async (queryTag) => {
    let filteredContacts = await this.model.filterByTag(queryTag);
    this.view.displayContacts(filteredContacts);
  }
}

const app = new Controller(new Model(), new View());
