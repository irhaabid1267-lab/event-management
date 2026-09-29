/* =====================================================
   EVENT MANAGEMENT SYSTEM
   CRUD + LOCAL STORAGE
===================================================== */


/* =====================================================
   LOCAL STORAGE KEY
===================================================== */

const STORAGE_KEY = "eventManagementSystem";


/* =====================================================
   GET HTML ELEMENTS
===================================================== */

const eventForm = document.getElementById("eventForm");

const eventTitle = document.getElementById("eventTitle");
const createdDate = document.getElementById("createdDate");
const eventDate = document.getElementById("eventDate");
const eventDescription = document.getElementById("eventDescription");
const eventType = document.getElementById("eventType");

const eventsContainer = document.getElementById("eventsContainer");
const emptyState = document.getElementById("emptyState");

const eventCount = document.getElementById("eventCount");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

const formHeading = document.getElementById("formHeading");

const searchInput = document.getElementById("searchInput");

const characterCount = document.getElementById("characterCount");


/* =====================================================
   EVENT DETAILS MODAL
===================================================== */

const eventModalElement = document.getElementById("eventModal");

const eventModal = new bootstrap.Modal(eventModalElement);

const modalTitle = document.getElementById("modalTitle");
const modalType = document.getElementById("modalType");
const modalCreatedDate = document.getElementById("modalCreatedDate");
const modalEventDate = document.getElementById("modalEventDate");
const modalDescription = document.getElementById("modalDescription");

const modalEditButton = document.getElementById("modalEditButton");
const modalDeleteButton = document.getElementById("modalDeleteButton");


/* =====================================================
   DELETE CONFIRMATION MODAL
===================================================== */

const deleteModalElement = document.getElementById("deleteModal");

const deleteModal = new bootstrap.Modal(deleteModalElement);

const confirmDeleteButton =
    document.getElementById("confirmDeleteButton");


/* =====================================================
   APPLICATION STATE
===================================================== */

let events = loadEvents();

let editingEventId = null;

let selectedEventId = null;


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setDefaultCreatedDate();

    renderEvents(events);

    updateEventCount();

});


/* =====================================================
   LOAD EVENTS FROM LOCAL STORAGE
===================================================== */

function loadEvents() {

    const storedEvents = localStorage.getItem(STORAGE_KEY);

    if (!storedEvents) {
        return [];
    }

    try {

        return JSON.parse(storedEvents);

    } catch (error) {

        console.error(
            "Unable to load events:",
            error
        );

        return [];

    }

}


/* =====================================================
   SAVE EVENTS TO LOCAL STORAGE
===================================================== */

function saveEvents() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );

}


/* =====================================================
   SET DEFAULT CREATED DATE
===================================================== */

function setDefaultCreatedDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    createdDate.value =
        `${year}-${month}-${day}`;

}


/* =====================================================
   CREATE / UPDATE EVENT
===================================================== */

eventForm.addEventListener("submit", function (event) {

    event.preventDefault();


    /* Validate form */

    if (!validateForm()) {
        return;
    }


    /* =================================================
       CREATE NEW EVENT
    ================================================= */

    if (editingEventId === null) {

        const newEvent = {

            id: Date.now(),

            title: eventTitle.value.trim(),

            createdDate: createdDate.value,

            eventDate: eventDate.value,

            description:
                eventDescription.value.trim(),

            type: eventType.value

        };


        /* Add new event at beginning */

        events.unshift(newEvent);


        /* Save to Local Storage */

        saveEvents();


        /* Refresh events */

        renderEvents(getFilteredEvents());

        updateEventCount();


        /* Success message */

        showMessage(
            "Event created successfully."
        );


        /* Reset form */

        resetForm();

    }


    /* =================================================
       UPDATE EXISTING EVENT
    ================================================= */

    else {

        const eventIndex = events.findIndex(
            item => item.id === editingEventId
        );


        if (eventIndex !== -1) {

            events[eventIndex] = {

                ...events[eventIndex],

                title:
                    eventTitle.value.trim(),

                createdDate:
                    createdDate.value,

                eventDate:
                    eventDate.value,

                description:
                    eventDescription.value.trim(),

                type:
                    eventType.value

            };


            /* Save updated data */

            saveEvents();


            /* Refresh events */

            renderEvents(getFilteredEvents());

            updateEventCount();


            /* Success message */

            showMessage(
                "Event updated successfully."
            );


            /* Reset form */

            resetForm();

        }

    }

});


/* =====================================================
   FORM VALIDATION
===================================================== */

function validateForm() {

    let isValid = true;


    /* =================================================
       EVENT TITLE
    ================================================= */

    if (eventTitle.value.trim() === "") {

        eventTitle.classList.add("is-invalid");

        isValid = false;

    } else {

        eventTitle.classList.remove("is-invalid");

    }


    /* =================================================
       EVENT TYPE
    ================================================= */

    if (eventType.value === "") {

        eventType.classList.add("is-invalid");

        isValid = false;

    } else {

        eventType.classList.remove("is-invalid");

    }


    /* =================================================
       CREATED DATE
    ================================================= */

    if (createdDate.value === "") {

        createdDate.classList.add("is-invalid");

        isValid = false;

    } else {

        createdDate.classList.remove("is-invalid");

    }


    /* =================================================
       EVENT DATE
    ================================================= */

    if (
        eventDate.value === "" ||
        (
            createdDate.value &&
            eventDate.value < createdDate.value
        )
    ) {

        eventDate.classList.add("is-invalid");

        isValid = false;

    } else {

        eventDate.classList.remove("is-invalid");

    }


    /* =================================================
       DESCRIPTION
    ================================================= */

    if (
        eventDescription.value.trim() === ""
    ) {

        eventDescription.classList.add(
            "is-invalid"
        );

        isValid = false;

    } else {

        eventDescription.classList.remove(
            "is-invalid"
        );

    }


    return isValid;

}


/* =====================================================
   REMOVE VALIDATION ERROR WHILE TYPING
===================================================== */

[
    eventTitle,
    createdDate,
    eventDate,
    eventDescription
].forEach(input => {

    input.addEventListener("input", () => {

        input.classList.remove(
            "is-invalid"
        );

    });

});


/* =====================================================
   REMOVE TYPE VALIDATION ERROR
===================================================== */

eventType.addEventListener("change", () => {

    eventType.classList.remove(
        "is-invalid"
    );

});


/* =====================================================
   CHARACTER COUNTER
===================================================== */

eventDescription.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            eventDescription.value.length;

    }
);


/* =====================================================
   RENDER EVENTS
===================================================== */

function renderEvents(eventList) {

    eventsContainer.innerHTML = "";


    /* =================================================
       NO EVENTS
    ================================================= */

    if (eventList.length === 0) {

        emptyState.classList.remove(
            "d-none"
        );

        return;

    }


    /* Hide empty state */

    emptyState.classList.add(
        "d-none"
    );


    /* =================================================
       CREATE CARDS
    ================================================= */

    eventList.forEach(event => {

        const card =
            createEventCard(event);

        eventsContainer.appendChild(card);

    });

}


/* =====================================================
   CREATE EVENT CARD
===================================================== */

function createEventCard(event) {

    const wrapper =
        document.createElement("div");


    /* Bootstrap responsive columns */

    wrapper.className =
        "col-12 col-md-6 col-lg-4 event-card-wrapper";


    /* =================================================
       ONLY TITLE IS SHOWN IN CARD
    ================================================= */

    wrapper.innerHTML = `

        <article class="event-card">

            <div class="event-card-top">

                <h3>
                    ${escapeHTML(event.title)}
                </h3>

            </div>

        </article>

    `;


    /* =================================================
       CARD CLICK → OPEN DETAILS POPUP
    ================================================= */

    wrapper.addEventListener(
        "click",
        () => {

            openEventDetails(event.id);

        }
    );


    return wrapper;

}


/* =====================================================
   VIEW EVENT DETAILS
===================================================== */

function openEventDetails(id) {

    const event = events.find(
        item => item.id === id
    );


    /* Event not found */

    if (!event) {
        return;
    }


    /* Store selected event */

    selectedEventId = id;


    /* =================================================
       FILL POPUP DATA
    ================================================= */

    modalTitle.textContent =
        event.title;

    modalType.textContent =
        event.type;

    modalCreatedDate.textContent =
        formatDate(
            event.createdDate
        );

    modalEventDate.textContent =
        formatDate(
            event.eventDate
        );

    modalDescription.textContent =
        event.description;


    /* =================================================
       SHOW POPUP
    ================================================= */

    eventModal.show();

}


/* =====================================================
   EDIT EVENT
===================================================== */

function startEdit(id) {

    const event = events.find(
        item => item.id === id
    );


    /* Event not found */

    if (!event) {
        return;
    }


    /* Store editing ID */

    editingEventId = id;


    /* =================================================
       LOAD EVENT DATA INTO FORM
    ================================================= */

    eventTitle.value =
        event.title;

    createdDate.value =
        event.createdDate;

    eventDate.value =
        event.eventDate;

    eventDescription.value =
        event.description;

    eventType.value =
        event.type;


    /* =================================================
       CHANGE FORM UI
    ================================================= */

    formHeading.textContent =
        "Update Event";


    submitButton.innerHTML =
        '<i class="bi bi-check-lg"></i> Update Event';


    cancelButton.classList.remove(
        "d-none"
    );


    /* Character counter */

    characterCount.textContent =
        eventDescription.value.length;


    /* =================================================
       CLOSE DETAILS MODAL
    ================================================= */

    eventModal.hide();


    /* =================================================
       SCROLL TO FORM
    ================================================= */

    document
        .querySelector(".form-section")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =====================================================
   CANCEL UPDATE
===================================================== */

cancelButton.addEventListener(
    "click",
    () => {

        resetForm();

    }
);


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    eventForm.reset();


    /* Reset editing state */

    editingEventId = null;


    /* Reset heading */

    formHeading.textContent =
        "Create New Event";


    /* Reset button */

    submitButton.innerHTML =
        '<i class="bi bi-plus-lg"></i> Create Event';


    /* Hide cancel button */

    cancelButton.classList.add(
        "d-none"
    );


    /* Reset character count */

    characterCount.textContent =
        "0";


    /* Remove validation errors */

    document
        .querySelectorAll(".is-invalid")
        .forEach(element => {

            element.classList.remove(
                "is-invalid"
            );

        });


    /* Set today's date */

    setDefaultCreatedDate();

}


/* =====================================================
   OPEN DELETE CONFIRMATION
===================================================== */

function openDeleteConfirmation(id) {

    /* Store selected event */

    selectedEventId = id;


    /* Open delete confirmation */

    deleteModal.show();

}


/* =====================================================
   CONFIRM DELETE
===================================================== */

confirmDeleteButton.addEventListener(
    "click",
    () => {

        /* No event selected */

        if (selectedEventId === null) {
            return;
        }


        /* =================================================
           DELETE FROM ARRAY
        ================================================= */

        events = events.filter(
            event =>
                event.id !== selectedEventId
        );


        /* =================================================
           SAVE UPDATED ARRAY
        ================================================= */

        saveEvents();


        /* =================================================
           REFRESH UI
        ================================================= */

        renderEvents(
            getFilteredEvents()
        );

        updateEventCount();


        /* Reset selected event */

        selectedEventId = null;


        /* Close delete popup */

        deleteModal.hide();


        /* Close details popup */

        eventModal.hide();


        /* Success message */

        showMessage(
            "Event deleted successfully."
        );

    }
);


/* =====================================================
   MODAL EDIT BUTTON
===================================================== */

modalEditButton.addEventListener(
    "click",
    () => {

        if (selectedEventId === null) {
            return;
        }


        startEdit(
            selectedEventId
        );

    }
);


/* =====================================================
   MODAL DELETE BUTTON
===================================================== */

modalDeleteButton.addEventListener(
    "click",
    () => {

        if (selectedEventId === null) {
            return;
        }


        /* Close details popup */

        eventModal.hide();


        /* Open delete confirmation */

        openDeleteConfirmation(
            selectedEventId
        );

    }
);


/* =====================================================
   SEARCH EVENTS
===================================================== */

searchInput.addEventListener(
    "input",
    () => {

        const filteredEvents =
            getFilteredEvents();


        renderEvents(
            filteredEvents
        );

    }
);


/* =====================================================
   FILTER EVENTS
===================================================== */

function getFilteredEvents() {

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    /* Show all events */

    if (searchText === "") {

        return events;

    }


    /* Search title, type and description */

    return events.filter(event =>

        event.title
            .toLowerCase()
            .includes(searchText)

        ||

        event.type
            .toLowerCase()
            .includes(searchText)

        ||

        event.description
            .toLowerCase()
            .includes(searchText)

    );

}


/* =====================================================
   UPDATE EVENT COUNT
===================================================== */

function updateEventCount() {

    eventCount.textContent =
        events.length;

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   ESCAPE HTML
   Prevents HTML Injection
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}


/* =====================================================
   SUCCESS MESSAGE
===================================================== */

function showMessage(message) {

    const alert =
        document.createElement("div");


    alert.className =
        "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow";


    alert.style.zIndex =
        "9999";


    alert.innerHTML = `

        <i class="bi bi-check-circle"></i>

        ${escapeHTML(message)}

    `;


    document.body.appendChild(alert);


    /* Remove after 2.5 seconds */

    setTimeout(() => {

        alert.remove();

    }, 2500);

}