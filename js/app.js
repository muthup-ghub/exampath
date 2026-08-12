let exams = [];


/*
 * Load exam data
 */
async function loadExams() {

    try {

        const response = await fetch("data/exams.json");

        exams = await response.json();

        displayExams(exams);

    } catch (error) {

        console.error("Unable to load exam data:", error);

    }
}


/*
 * Display exams
 */
function displayExams(data) {

    const examList = document.getElementById("examList");

    examList.innerHTML = "";

    data.forEach(exam => {

        const card = document.createElement("div");

        card.className = "exam-card";

        card.innerHTML = `
            <h3>${exam.name}</h3>

            <p>
                <strong>Category:</strong>
                ${exam.category}
            </p>

            <p>
                <strong>Location:</strong>
                ${exam.location}
            </p>

            <p>
                <strong>Application Deadline:</strong>
                ${exam.application_deadline}
            </p>

            <a href="${exam.official_url}"
               target="_blank"
               rel="noopener noreferrer">
                Official Website →
            </a>
        `;

        examList.appendChild(card);

    });
}


/*
 * Search
 */
function search() {

    const query =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    if (!query) {

        displayExams(exams);

        return;
    }

    const results = exams.filter(exam =>

        exam.name.toLowerCase().includes(query) ||

        exam.category.toLowerCase().includes(query) ||

        exam.location.toLowerCase().includes(query)

    );

    displayExams(results);
}


/*
 * Category filter
 */
function filterCategory(category) {

    const results = exams.filter(exam =>
        exam.category === category
    );

    displayExams(results);
}


/*
 * Start application
 */
loadExams();