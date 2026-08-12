let institutions = [];
let exams = [];
let courses = [];
let opportunities = [];
let sources = [];


/*
 * Load all ExamPath data
 */
async function loadData() {

    try {

        const [
            institutionsResponse,
            examsResponse,
            coursesResponse,
            opportunitiesResponse,
            sourcesResponse
        ] = await Promise.all([

            fetch("data/institutions.json"),
            fetch("data/exams.json"),
            fetch("data/courses.json"),
            fetch("data/opportunities.json"),
            fetch("data/sources.json")

        ]);


        institutions = await institutionsResponse.json();
        exams = await examsResponse.json();
        courses = await coursesResponse.json();
        opportunities = await opportunitiesResponse.json();
        sources = await sourcesResponse.json();


        displayOpportunities(opportunities);

    } catch (error) {

        console.error(
            "Unable to load ExamPath data:",
            error
        );

    }
}


/*
 * Find institution
 */
function getInstitution(id) {

    return institutions.find(
        institution => institution.id === id
    );

}


/*
 * Find exam
 */
function getExam(id) {

    return exams.find(
        exam => exam.id === id
    );

}


/*
 * Find course
 */
function getCourse(id) {

    return courses.find(
        course => course.id === id
    );

}


/*
 * Find source
 */
function getSource(id) {

    return sources.find(
        source => source.id === id
    );

}


/*
 * Display opportunities
 */
function displayOpportunities(data) {

    const examList =
        document.getElementById("examList");

    examList.innerHTML = "";


    if (data.length === 0) {

        examList.innerHTML = `
            <p>No opportunities found.</p>
        `;

        return;

    }


    data.forEach(opportunity => {

        const institution =
            getInstitution(
                opportunity.institution_id
            );

        const exam =
            getExam(
                opportunity.exam_id
            );

        const course =
            getCourse(
                opportunity.course_id
            );

        const source =
            getSource(
                opportunity.source_id
            );


        const card =
            document.createElement("div");

        card.className = "exam-card";


        card.innerHTML = `

            <h3>
                ${exam ? exam.name : "Exam"}
            </h3>

            <p>
                <strong>Institution:</strong>
                ${institution
                    ? institution.name
                    : "Not available"}
            </p>

            <p>
                <strong>Course:</strong>
                ${course
                    ? course.name
                    : "Not available"}
            </p>

            <p>
                <strong>Academic Year:</strong>
                ${opportunity.academic_year}
            </p>

            <p>
                <strong>Status:</strong>
                ${opportunity.status}
            </p>

            <p>
                <strong>Application Deadline:</strong>
                ${opportunity.application_deadline
                    || "To be announced"}
            </p>

            <a
                href="${opportunity.application_url}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Official Application →
            </a>

            ${
                source
                    ? `
                        <br>
                        <a
                            href="${source.url}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Source →
                        </a>
                    `
                    : ""
            }

        `;


        examList.appendChild(card);

    });

}


/*
 * Search opportunities
 */
function search() {

    const query =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    if (!query) {

        displayOpportunities(opportunities);

        return;

    }


    const results =
        opportunities.filter(opportunity => {

            const institution =
                getInstitution(
                    opportunity.institution_id
                );

            const exam =
                getExam(
                    opportunity.exam_id
                );

            const course =
                getCourse(
                    opportunity.course_id
                );


            return (

                (
                    institution &&
                    institution.name
                        .toLowerCase()
                        .includes(query)
                )

                ||

                (
                    exam &&
                    exam.name
                        .toLowerCase()
                        .includes(query)
                )

                ||

                (
                    course &&
                    course.name
                        .toLowerCase()
                        .includes(query)
                )

            );

        });


    displayOpportunities(results);

}


/*
 * Filter by category
 */
function filterCategory(category) {

    const results =
        opportunities.filter(opportunity => {

            const exam =
                getExam(
                    opportunity.exam_id
                );


            const course =
                getCourse(
                    opportunity.course_id
                );


            return (

                (
                    exam &&
                    exam.category === category
                )

                ||

                (
                    course &&
                    course.stream === category
                )

            );

        });


    displayOpportunities(results);

}


/*
 * Start ExamPath
 */
loadData();