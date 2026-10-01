const API = "";

let loggedInStudent = null;
let selectedCompanyId = null;


// ========================================
// SHOW SECTION
// ========================================

function showSection(id) {

    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ========================================
// LOAD COMPANIES
// ========================================

async function loadCompanies() {

    try {

        const response =
            await fetch(`${API}/api/companies`);

        const companies =
            await response.json();

        displayCompanies(companies);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "companiesContainer"
        ).innerHTML =
            "<p>Unable to load companies.</p>";
    }
}


// ========================================
// DISPLAY COMPANIES
// ========================================

function displayCompanies(companies) {

    const container =
        document.getElementById(
            "companiesContainer"
        );

    if (!companies.length) {

        container.innerHTML =
            "<p>No companies available.</p>";

        return;
    }


    container.innerHTML = companies.map(company => {

        return `

        <div class="company-card">

            <h3>
                ${company.company_name}
            </h3>

            <p>
                <b>Job Role:</b>
                ${company.job_role}
            </p>

            <p>
                <b>Package:</b>
                ${company.package || "Not specified"}
            </p>

            <p>
                <b>Eligible Branches:</b>
                ${company.eligible_branches || "All"}
            </p>

            <p>
                <b>Minimum CGPA:</b>
                ${company.minimum_cgpa || "Not specified"}
            </p>

            <p>
                <b>Skills:</b>
                ${company.required_skills || "Not specified"}
            </p>

            <p>
                <b>Location:</b>
                ${company.location || "Not specified"}
            </p>

            <p>
                <b>Deadline:</b>
                ${company.deadline || "Not specified"}
            </p>

            <button
                onclick="openApplication(${company.id}, '${escapeQuotes(company.company_name)}')">

                Apply Now

            </button>

        </div>

        `;

    }).join("");
}


// ========================================
// ESCAPE QUOTES
// ========================================

function escapeQuotes(value) {

    return String(value)
        .replace(/'/g, "\\'");
}


// ========================================
// BRANCH CHANGE
// ========================================

function handleBranchChange() {

    const branch =
        document.getElementById(
            "branch"
        ).value;

    const specializationBox =
        document.getElementById(
            "specializationBox"
        );


    if (branch === "CSE") {

        specializationBox.style.display =
            "block";

    } else {

        specializationBox.style.display =
            "none";

        document.getElementById(
            "specialization"
        ).value = "";

    }
}


// ========================================
// REGISTER
// ========================================

document
    .getElementById("registerForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const data = {

                name:
                    document.getElementById(
                        "studentName"
                    ).value,

                roll_number:
                    document.getElementById(
                        "rollNumber"
                    ).value,

                email:
                    document.getElementById(
                        "studentEmail"
                    ).value,

                branch:
                    document.getElementById(
                        "branch"
                    ).value,

                specialization:
                    document.getElementById(
                        "specialization"
                    ).value,

                cgpa:
                    document.getElementById(
                        "cgpa"
                    ).value,

                skills:
                    document.getElementById(
                        "skills"
                    ).value,

                password:
                    document.getElementById(
                        "registerPassword"
                    ).value

            };


            try {

                const response =
                    await fetch(
                        `${API}/api/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Registration failed"
                    );

                    return;
                }


                alert(
                    "Registration successful!"
                );


                document
                    .getElementById(
                        "registerForm"
                    )
                    .reset();


                document.getElementById(
                    "specializationBox"
                ).style.display = "none";


                showSection("login");

            } catch (error) {

                console.error(error);

                alert(
                    "Server connection failed."
                );

            }

        }
    );


// ========================================
// LOGIN
// ========================================

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const roll_number =
                document.getElementById(
                    "loginRollNumber"
                ).value;

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API}/api/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    roll_number,
                                    password
                                })
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Login failed"
                    );

                    return;
                }


                loggedInStudent =
                    result.student;


                localStorage.setItem(
                    "loggedInStudent",
                    JSON.stringify(
                        loggedInStudent
                    )
                );


                document.getElementById(
                    "logoutBtn"
                ).style.display = "block";


                showStudentDashboard();

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );

            }

        }
    );


// ========================================
// STUDENT DASHBOARD
// ========================================

function showStudentDashboard() {

    if (!loggedInStudent) {
        return;
    }


    const dashboard =
        document.getElementById(
            "studentDashboard"
        );

    dashboard.style.display =
        "block";


    document.getElementById(
        "studentWelcome"
    ).innerText =
        `Welcome, ${loggedInStudent.name}`;


    document.getElementById(
        "studentProfile"
    ).innerHTML = `

        <p>
            <b>Name:</b>
            ${loggedInStudent.name}
        </p>

        <p>
            <b>Roll Number:</b>
            ${loggedInStudent.roll_number}
        </p>

        <p>
            <b>Email:</b>
            ${loggedInStudent.email}
        </p>

        <p>
            <b>Branch:</b>
            ${loggedInStudent.branch}
        </p>

        <p>
            <b>Specialization:</b>
            ${loggedInStudent.specialization || "N/A"}
        </p>

        <p>
            <b>CGPA:</b>
            ${loggedInStudent.cgpa}
        </p>

        <p>
            <b>Skills:</b>
            ${loggedInStudent.skills || "N/A"}
        </p>

    `;


    loadMyApplications();

    dashboard.scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// OPEN APPLICATION
// ========================================

function openApplication(
    companyId,
    companyName
) {

    if (!loggedInStudent) {

        alert(
            "Please login as a student first."
        );

        showSection("login");

        return;
    }


    selectedCompanyId =
        companyId;


    document.getElementById(
        "applicationCompanyId"
    ).value = companyId;


    document.getElementById(
        "applicationCompanyName"
    ).innerText =
        `Apply for ${companyName}`;


    document.getElementById(
        "applicationSection"
    ).style.display =
        "flex";


    document.getElementById(
        "applicationSection"
    ).scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// APPLICATION SUBMIT
// ========================================

document
    .getElementById("applicationForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!loggedInStudent) {

                alert(
                    "Please login first."
                );

                return;
            }


            const resume =
                document.getElementById(
                    "resume"
                ).files[0];

            const certificate =
                document.getElementById(
                    "certificate"
                ).files[0];


            if (!resume) {

                alert(
                    "Please upload your resume."
                );

                return;
            }


            const data = {

                student_id:
                    loggedInStudent.id,

                company_id:
                    selectedCompanyId,

                technical_domain:
                    document.getElementById(
                        "technicalDomain"
                    ).value,

                technical_skills:
                    document.getElementById(
                        "technicalSkills"
                    ).value,

                resume_name:
                    resume.name,

                certificate_name:
                    certificate
                        ? certificate.name
                        : "",

                project_links:
                    document.getElementById(
                        "projectLinks"
                    ).value,

                candidate_type:
                    document.getElementById(
                        "candidateType"
                    ).value

            };


            try {

                const response =
                    await fetch(
                        `${API}/api/applications`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Application failed"
                    );

                    return;
                }


                alert(
                    "Application submitted successfully!"
                );


                document
                    .getElementById(
                        "applicationForm"
                    )
                    .reset();


                closeApplicationForm();

                loadMyApplications();

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );

            }

        }
    );


// ========================================
// CLOSE APPLICATION
// ========================================

function closeApplicationForm() {

    document.getElementById(
        "applicationSection"
    ).style.display =
        "none";
}


// ========================================
// MY APPLICATIONS
// ========================================

async function loadMyApplications() {

    if (!loggedInStudent) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/api/applications`
            );


        const applications =
            await response.json();


        const myApplications =
            applications.filter(
                application =>
                    application.student_id ==
                    loggedInStudent.id
            );


        const container =
            document.getElementById(
                "myApplications"
            );


        if (!myApplications.length) {

            container.innerHTML =
                "<p>No applications found.</p>";

            return;
        }


        container.innerHTML = `

        <table>

            <tr>
                <th>Company</th>
                <th>Job Role</th>
                <th>Status</th>
                <th>Round</th>
            </tr>

            ${myApplications.map(app => `

                <tr>

                    <td>
                        ${app.company_name}
                    </td>

                    <td>
                        ${app.job_role}
                    </td>

                    <td>
                        ${app.status}
                    </td>

                    <td>
                        ${app.round}
                    </td>

                </tr>

            `).join("")}

        </table>

        `;

    } catch (error) {

        console.error(error);

    }
}


// ========================================
// OFFICER LOGIN
// ========================================

document
    .getElementById("officerLoginForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "officerUsername"
                ).value;

            const password =
                document.getElementById(
                    "officerPassword"
                ).value;


            if (
                username === "officer" &&
                password === "mits123"
            ) {

                alert(
                    "Officer login successful!"
                );


                document.getElementById(
                    "officerDashboard"
                ).style.display =
                    "block";


                document.getElementById(
                    "logoutBtn"
                ).style.display =
                    "block";


                loadOfficerDashboard();


                document.getElementById(
                    "officerDashboard"
                ).scrollIntoView({
                    behavior: "smooth"
                });

            } else {

                alert(
                    "Invalid officer username or password."
                );

            }

        }
    );


// ========================================
// OFFICER DASHBOARD
// ========================================

async function loadOfficerDashboard() {

    await loadOfficerCompanies();

    await loadOfficerApplications();

}


// ========================================
// OFFICER COMPANIES
// ========================================

async function loadOfficerCompanies() {

    try {

        const response =
            await fetch(
                `${API}/api/companies`
            );


        const companies =
            await response.json();


        document.getElementById(
            "totalCompanies"
        ).innerText =
            companies.length;


        const container =
            document.getElementById(
                "officerCompanies"
            );


        if (!companies.length) {

            container.innerHTML =
                "<p>No companies available.</p>";

            return;
        }


        container.innerHTML = `

        <table>

            <tr>

                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Branches</th>
                <th>Action</th>

            </tr>


            ${companies.map(company => `

                <tr>

                    <td>
                        ${company.company_name}
                    </td>

                    <td>
                        ${company.job_role}
                    </td>

                    <td>
                        ${company.package || "-"}
                    </td>

                    <td>
                        ${company.eligible_branches || "-"}
                    </td>

                    <td>

                        <button
                            onclick="deleteCompany(${company.id})">

                            Delete

                        </button>

                    </td>

                </tr>

            `).join("")}

        </table>

        `;

    } catch (error) {

        console.error(error);

    }
}


// ========================================
// DELETE COMPANY
// ========================================

async function deleteCompany(id) {

    if (
        !confirm(
            "Are you sure you want to delete this company?"
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/api/companies/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        alert(result.message);


        loadOfficerCompanies();

        loadCompanies();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete company."
        );

    }
}


// ========================================
// OFFICER APPLICATIONS
// ========================================

async function loadOfficerApplications() {

    try {

        const response =
            await fetch(
                `${API}/api/applications`
            );


        const applications =
            await response.json();


        document.getElementById(
            "totalApplications"
        ).innerText =
            applications.length;


        const selected =
            applications.filter(
                app =>
                    app.status === "Selected"
            );


        document.getElementById(
            "totalSelected"
        ).innerText =
            selected.length;


        const container =
            document.getElementById(
                "officerApplications"
            );


        if (!applications.length) {

            container.innerHTML =
                "<p>No applications found.</p>";

            return;
        }


        container.innerHTML = `

        <table>

            <tr>

                <th>Student</th>
                <th>Roll Number</th>
                <th>Company</th>
                <th>Status</th>
                <th>Round</th>
                <th>Update</th>

            </tr>


            ${applications.map(app => `

                <tr>

                    <td>
                        ${app.student_name}
                    </td>

                    <td>
                        ${app.roll_number}
                    </td>

                    <td>
                        ${app.company_name}
                    </td>

                    <td>
                        ${app.status}
                    </td>

                    <td>
                        ${app.round}
                    </td>

                    <td>

                        <select
                            id="status-${app.id}">

                            <option
                                value="Applied">
                                Applied
                            </option>

                            <option
                                value="Shortlisted">
                                Shortlisted
                            </option>

                            <option
                                value="Selected">
                                Selected
                            </option>

                            <option
                                value="Not Selected">
                                Not Selected
                            </option>

                        </select>


                        <select
                            id="round-${app.id}">

                            <option>
                                Application Submitted
                            </option>

                            <option>
                                Aptitude Test
                            </option>

                            <option>
                                Technical Interview
                            </option>

                            <option>
                                HR Interview
                            </option>

                            <option>
                                Final Result
                            </option>

                        </select>


                        <button
                            onclick="updateApplication(${app.id})">

                            Update

                        </button>

                    </td>

                </tr>

            `).join("")}

        </table>

        `;

    } catch (error) {

        console.error(error);

    }
}


// ========================================
// UPDATE APPLICATION
// ========================================

async function updateApplication(id) {

    const status =
        document.getElementById(
            `status-${id}`
        ).value;


    const round =
        document.getElementById(
            `round-${id}`
        ).value;


    try {

        const response =
            await fetch(
                `${API}/api/applications/${id}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status,
                            round
                        })
                }
            );


        const result =
            await response.json();


        alert(result.message);


        loadOfficerApplications();

        loadMyApplications();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update application."
        );

    }
}


// ========================================
// ADD COMPANY
// ========================================

document
    .getElementById("companyForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const company = {

                company_name:
                    document.getElementById(
                        "companyName"
                    ).value,

                job_role:
                    document.getElementById(
                        "jobRole"
                    ).value,

                package:
                    document.getElementById(
                        "package"
                    ).value,

                eligible_branches:
                    document.getElementById(
                        "eligibleBranches"
                    ).value,

                minimum_cgpa:
                    document.getElementById(
                        "minimumCgpa"
                    ).value,

                required_skills:
                    document.getElementById(
                        "requiredSkills"
                    ).value,

                location:
                    document.getElementById(
                        "companyLocation"
                    ).value,

                deadline:
                    document.getElementById(
                        "deadline"
                    ).value

            };


            try {

                const response =
                    await fetch(
                        `${API}/api/companies`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(company)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to add company."
                    );

                    return;
                }


                alert(
                    "Company added successfully!"
                );


                document
                    .getElementById(
                        "companyForm"
                    )
                    .reset();


                loadCompanies();

                loadOfficerCompanies();

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );

            }

        }
    );


// ========================================
// LOGOUT
// ========================================

function logout() {

    loggedInStudent = null;

    localStorage.removeItem(
        "loggedInStudent"
    );


    document.getElementById(
        "studentDashboard"
    ).style.display =
        "none";


    document.getElementById(
        "officerDashboard"
    ).style.display =
        "none";


    document.getElementById(
        "logoutBtn"
    ).style.display =
        "none";


    alert(
        "Logged out successfully."
    );


    showSection("home");
}


// ========================================
// LOAD SAVED LOGIN
// ========================================

window.addEventListener(
    "DOMContentLoaded",
    function() {

        const savedStudent =
            localStorage.getItem(
                "loggedInStudent"
            );


        if (savedStudent) {

            try {

                loggedInStudent =
                    JSON.parse(
                        savedStudent
                    );


                document.getElementById(
                    "logoutBtn"
                ).style.display =
                    "block";

            } catch (error) {

                localStorage.removeItem(
                    "loggedInStudent"
                );

            }

        }


        loadCompanies();

    }
);