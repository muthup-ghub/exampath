let institutions = [];
let exams = [];
let courses = [];
let opportunities = [];
let sources = [];

const examList = document.getElementById("examList");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const searchStatus = document.getElementById("searchStatus");

function setStatus(message, isError = false) {
    if (!searchStatus) {
        return;
    }

    searchStatus.textContent = message;
    searchStatus.className = isError ? "error-message" : "";
}

async function fetchJson(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(`${path} must contain a JSON array`);
    }

    return data;
}

/*
 * Load all ExamPath data
 */
async function loadData() {
    try {
        const [
            institutionsData,
            examsData,
            coursesData,
            opportunitiesData,
            sourcesData
        ] = await Promise.all([
            fetchJson("data/institutions.json"),
            fetchJson("data/exams.json"),
            fetchJson("data/courses.json"),
            fetchJson("data/opportunities.json"),
            fetchJson("data/sources.json")
        ]);

        institutions = institutionsData;
        exams = examsData;
        courses = coursesData;
        opportunities = opportunitiesData;
        sources = sourcesData;

        displayOpportunities(opportunities);
        setStatus(`${opportunities.length} opportunities found.`);
    } catch (error) {
        console.error("Unable to load ExamPath data:", error);

        if (examList) {
            examList.innerHTML = "";

            const errorMessage = document.createElement("p");
            errorMessage.className = "error-message";
            errorMessage.textContent =
                "Unable to load exam data. Please try again later.";

            examList.appendChild(errorMessage);
        }

        setStatus("Unable to load application data.", true);
    }
}

/*
 * Find records by ID
 */
function getInstitution(id) {
    return institutions.find(institution => institution.id === id);
}

function getExam(id) {
    return exams.find(exam => exam.id === id);
}

function getCourse(id) {
    return courses.find(course => course.id === id);
}

function getSource(id) {
    return sources.find(source => source.id === id);
}

/*
 * Create a safe external link
 */
function createExternalLink(url, label) {
    if (!url || typeof url !== "string") {
        return null;
    }

    try {
        const parsedUrl = new URL(url, window.location.origin);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return null;
        }

        const link = document.createElement("a");
        link.href = parsedUrl.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;

        return link;
    } catch {
        return null;
    }
}

/*
 * Create an opportunity card
 */
function createOpportunityCard(opportunity) {
    const institution = getInstitution(opportunity.institution_id);
    const exam = getExam(opportunity.exam_id);
    const course = getCourse(opportunity.course_id);
    const source = getSource(opportunity.source_id);

    const card = document.createElement("article");
    card.className = "exam-card";

    const title = document.createElement("h3");
    title.textContent = exam?.name || "Exam";
    card.appendChild(title);

    const institutionText = document.createElement("p");
    institutionText.innerHTML = "<strong>Institution:</strong> ";
    institutionText.append(
        institution?.name || "Not available"
    );
    card.appendChild(institutionText);

    const courseText = document.createElement("p");
    courseText.innerHTML = "<strong>Course:</strong> ";
    courseText.append(
        course?.name || "Not available"
    );
    card.appendChild(courseText);

    const academicYearText = document.createElement("p");
    academicYearText.innerHTML = "<strong>Academic Year:</strong> ";
    academicYearText.append(
        opportunity.academic_year || "Not available"
    );
    card.appendChild(academicYearText);

    const statusText = document.createElement("p");
    statusText.innerHTML = "<strong>Status:</strong> ";
    statusText.append(
        opportunity.status || "Not available"
    );
    card.appendChild(statusText);

    const deadlineText = document.createElement("p");
    deadlineText.innerHTML = "<strong>Application Deadline:</strong> ";
    deadlineText.append(
        opportunity.application_deadline || "To be announced"
    );
    card.appendChild(deadlineText);

    const applicationLink = createExternalLink(
        opportunity.application_url,
        "Official Application →"
    );

    if (applicationLink) {
        card.appendChild(applicationLink);
    } else {
        const unavailableText = document.createElement("p");
        unavailableText.textContent = "Official application link unavailable.";
        card.appendChild(unavailableText);
    }

    const sourceLink = createExternalLink(
        source?.url,
        "Source →"
    );

    if (sourceLink) {
        card.appendChild(document.createElement("br"));
        card.appendChild(sourceLink);
    }

    return card;
}

/*
 * Display opportunities
 */
function displayOpportunities(data) {
    if (!examList) {
        return;
    }

    examList.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No opportunities found.";
        examList.appendChild(emptyMessage);
        setStatus("No opportunities found.");
        return;
    }

    data.forEach(opportunity => {
        examList.appendChild(createOpportunityCard(opportunity));
    });

    setStatus(`${data.length} opportunit${data.length === 1 ? "y" : "ies"} found.`);
}

/*
 * Search opportunities
 */
function search() {
    const query = searchInput?.value.toLowerCase().trim() || "";

    if (!query) {
        displayOpportunities(opportunities);
        return;
    }

    const results = opportunities.filter(opportunity => {
        const institution = getInstitution(opportunity.institution_id);
        const exam = getExam(opportunity.exam_id);
        const course = getCourse(opportunity.course_id);
        const source = getSource(opportunity.source_id);

        const searchableText = [
            institution?.name,
            exam?.name,
            exam?.category,
            course?.name,
            course?.stream,
            opportunity.status,
            opportunity.academic_year,
            opportunity.application_deadline,
            source?.name
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(query);
    });

    displayOpportunities(results);
}

/*
 * Filter by category
 */
function filterCategory(category) {
    const results = opportunities.filter(opportunity => {
        const exam = getExam(opportunity.exam_id);
        const course = getCourse(opportunity.course_id);

        return (
            exam?.category === category ||
            course?.stream === category
        );
    });

    displayOpportunities(results);
}

/*
 * Search form handling
 */
searchForm?.addEventListener("submit", event => {
    event.preventDefault();
    search();
});

/*
 * Start ExamPath
 */
loadData();
