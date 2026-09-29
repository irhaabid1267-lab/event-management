
/* =========================
   EVENT MANAGEMENT SYSTEM
   CRUD + LOCAL STORAGE
========================= */

const STORAGE_KEY = "eventManagementSystem";

/* Elements */
const eventForm = document.getElementById("eventForm");
const eventTitle = document.getElementById("eventTitle");
const eventType = document.getElementById("eventType");
const createdDate = document.getElementById("createdDate");
const eventDate = document.getElementById("eventDate");
const eventDescription = document.getElementById("eventDescription");

const eventsContainer = document.getElementById("eventsContainer");
const emptyState = document.getElementById("emptyState");
const eventCount = document.getElementById("eventCount");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const formHeading = document.getElementById("formHeading");
const searchInput = document.getElementById("searchInput");
const characterCount = document.getElementById("characterCount");

/* Details Modal */
const eventModal = new bootstrap.Modal(
    document.getElementById("eventModal")
);

const modalTitle = document.getElementById("modalTitle");
const modalType = document.getElementById("modalType");
const modalCreatedDate = document.getElementById("modalCreatedDate");
const modalEventDate = document.getElementById("modalEventDate");
const modalDescription = document.getElementById("modalDescription");

const modalEditButton = document.getElementById("modalEditButton");
const modalDeleteButton = document.getElementById("modalDeleteButton");

/* Delete Modal */
const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteModal")
);

const confirmDeleteButton =
    document.getElementById("confirmDeleteButton");

/* State */
let events = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

let editingEventId = null;
let selectedEventId = null;


/* =========================
   PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", () => {
    setDefaultDate();
    renderEvents(events);
    updateCount();
});


/* =========================
   LOCAL STORAGE
========================= */

function saveEvents() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );
}


/* =========================
   DEFAULT DATE
========================= */

function setDefaultDate() {
    createdDate.value = new Date()
        .toISOString()
        .split("T")[0];
}


/* =========================
   CREATE / UPDATE
========================= */

eventForm.addEventListener("submit", e => {

    e.preventDefault();

    if (!validateForm()) return;

    const data = {
        title: eventTitle.value.trim(),
        type: eventType.value,
        createdDate: createdDate.value,
        eventDate: eventDate.value,
        description: eventDescription.value.trim()
    };

    /* Create */
    if (editingEventId === null) {

        events.unshift({
            id: Date.now(),
            ...data
        });

        showMessage("Event created successfully.");

    }

    /* Update */
    else {

        const index = events.findIndex(
            event => event.id === editingEventId
        );

        if (index !== -1) {
            events[index] = {
                ...events[index],
                ...data
            };

            showMessage("Event updated successfully.");
        }
    }

    saveEvents();
    renderEvents(getFilteredEvents());
    updateCount();
    resetForm();
});


/* =========================
   VALIDATION
========================= */

function validateForm() {

    let valid = true;

    const fields = [
        eventTitle,
        eventType,
        createdDate,
        eventDate,
        eventDescription
    ];

    fields.forEach(field => {

        if (!field.value.trim()) {
            field.classList.add("is-invalid");
            valid = false;
        } else {
            field.classList.remove("is-invalid");
        }
    });

    if (
        createdDate.value &&
        eventDate.value &&
        eventDate.value < createdDate.value
    ) {
        eventDate.classList.add("is-invalid");
        valid = false;
    }

    return valid;
}


/* Remove validation while typing */

[
    eventTitle,
    eventType,
    createdDate,
    eventDate,
    eventDescription
].forEach(field => {

    field.addEventListener("input", () => {
        field.classList.remove("is-invalid");
    });

    field.addEventListener("change", () => {
        field.classList.remove("is-invalid");
    });
});


/* =========================
   CHARACTER COUNT
========================= */

eventDescription.addEventListener("input", () => {

    characterCount.textContent =
        eventDescription.value.length;

});


/* =========================
   RENDER EVENTS
========================= */

function renderEvents(list) {

    eventsContainer.innerHTML = "";

    emptyState.classList.toggle(
        "d-none",
        list.length !== 0
    );

    list.forEach(event => {
        eventsContainer.appendChild(
            createEventCard(event)
        );
    });
}


/* =========================
   EVENT CARD
========================= */

function createEventCard(event) {

    const wrapper = document.createElement("div");

    wrapper.className =
        "col-12 col-md-6 col-lg-4 event-card-wrapper";

    wrapper.innerHTML = `
    < article class="event-card" >
        <h3>${escapeHTML(event.title)}</h3>
        </article >
    `;

    wrapper.addEventListener("click", () => {
        openDetails(event.id);
    });

    return wrapper;
}


/* =========================
   DETAILS MODAL
========================= */

function openDetails(id) {

    const event = events.find(
        item => item.id === id
    );

    if (!event) return;

    selectedEventId = id;

    modalTitle.textContent = event.title;
    modalType.textContent = event.type;

    modalCreatedDate.textContent =
        formatDate(event.createdDate);

    modalEventDate.textContent =
        formatDate(event.eventDate);

    modalDescription.textContent =
        event.description;

    eventModal.show();
}


/* =========================
   EDIT
========================= */

function startEdit(id) {

    const event = events.find(
        item => item.id === id
    );

    if (!event) return;

    editingEventId = id;

    eventTitle.value = event.title;
    eventType.value = event.type;
    createdDate.value = event.createdDate;
    eventDate.value = event.eventDate;
    eventDescription.value = event.description;

    formHeading.textContent = "Update Event";

    submitButton.innerHTML =
        '<i class="bi bi-check-lg"></i> Update Event';

    cancelButton.classList.remove("d-none");

    characterCount.textContent =
        eventDescription.value.length;

    eventModal.hide();

    document
        .querySelector(".form-section")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* =========================
   MODAL EDIT
========================= */

modalEditButton.addEventListener("click", () => {

    if (selectedEventId !== null) {
        startEdit(selectedEventId);
    }

});


/* =========================
   MODAL DELETE
========================= */

modalDeleteButton.addEventListener("click", () => {

    if (selectedEventId === null) return;

    eventModal.hide();
    deleteModal.show();

});


/* =========================
   DELETE
========================= */

confirmDeleteButton.addEventListener("click", () => {

    if (selectedEventId === null) return;

    events = events.filter(
        event => event.id !== selectedEventId
    );

    saveEvents();
    renderEvents(getFilteredEvents());
    updateCount();

    selectedEventId = null;

    deleteModal.hide();

    showMessage("Event deleted successfully.");
});


/* =========================
   CANCEL UPDATE
========================= */

cancelButton.addEventListener("click", resetForm);


function resetForm() {

    eventForm.reset();

    editingEventId = null;

    formHeading.textContent =
        "Create New Event";

    submitButton.innerHTML =
        '<i class="bi bi-plus-lg"></i> Create Event';

    cancelButton.classList.add("d-none");

    characterCount.textContent = "0";

    document
        .querySelectorAll(".is-invalid")
        .forEach(field => {
            field.classList.remove("is-invalid");
        });

    setDefaultDate();
}


/* =========================
   SEARCH
========================= */

searchInput.addEventListener("input", () => {

    renderEvents(
        getFilteredEvents()
    );

});


function getFilteredEvents() {

    const text =
        searchInput.value.trim().toLowerCase();

    if (!text) return events;

    return events.filter(event =>
        event.title.toLowerCase().includes(text) ||
        event.type.toLowerCase().includes(text) ||
        event.description.toLowerCase().includes(text)
    );
}


/* =========================
   EVENT COUNT
========================= */

function updateCount() {

    eventCount.textContent =
        events.length;

}


/* =========================
   DATE FORMAT
========================= */

function formatDate(date) {

    return new Date(
        `${date} T00:00:00`
    ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


/* =========================
   SUCCESS MESSAGE
========================= */

function showMessage(message) {

    const alert = document.createElement("div");

    alert.className =
        "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow";

    alert.style.zIndex = "9999";

    alert.innerHTML = `
    < i class="bi bi-check-circle" ></i >
        ${escapeHTML(message)}
`;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 2500);
}

