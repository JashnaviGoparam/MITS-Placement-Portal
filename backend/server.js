const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Serve frontend website
app.use(express.static(path.join(__dirname, "public")));


// ==========================================
// GET ALL COMPANIES
// ==========================================

app.get("/api/companies", (req, res) => {

    const sql = `
        SELECT *
        FROM companies
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Failed to get companies"
            });

        }

        res.json(results);

    });

});


// ==========================================
// STUDENT REGISTRATION
// ==========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            roll_number,
            email,
            branch,
            specialization,
            cgpa,
            skills,
            password
        } = req.body;


        if (
            !name ||
            !roll_number ||
            !email ||
            !branch ||
            !cgpa ||
            !password
        ) {

            return res.status(400).json({
                message: "Please fill all required fields"
            });

        }


        // Check existing student

        const checkSql = `
            SELECT id
            FROM students
            WHERE roll_number = ?
               OR email = ?
        `;


        db.query(
            checkSql,
            [roll_number, email],
            async (err, results) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message: "Database error"
                    });

                }


                if (results.length > 0) {

                    return res.status(409).json({
                        message:
                            "Roll number or email already registered"
                    });

                }


                // Encrypt password

                const hashedPassword =
                    await bcrypt.hash(password, 10);


                const insertSql = `
                    INSERT INTO students
                    (
                        name,
                        roll_number,
                        email,
                        branch,
                        specialization,
                        cgpa,
                        skills,
                        password
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;


                db.query(
                    insertSql,
                    [
                        name,
                        roll_number,
                        email,
                        branch,
                        specialization || null,
                        cgpa,
                        skills || "",
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                message:
                                    "Registration failed"
                            });

                        }


                        res.status(201).json({

                            message:
                                "Registration successful",

                            student_id:
                                result.insertId

                        });

                    }
                );

            }
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==========================================
// STUDENT LOGIN
// ==========================================

app.post("/api/login", (req, res) => {

    const {
        roll_number,
        password
    } = req.body;


    if (!roll_number || !password) {

        return res.status(400).json({
            message:
                "Please enter Roll Number and Password"
        });

    }


    const sql = `
        SELECT *
        FROM students
        WHERE roll_number = ?
    `;


    db.query(
        sql,
        [roll_number],
        async (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }


            if (results.length === 0) {

                return res.status(401).json({
                    message:
                        "Invalid Roll Number or Password"
                });

            }


            const student = results[0];


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    student.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        "Invalid Roll Number or Password"
                });

            }


            // Do not send password to frontend

            delete student.password;


            res.json({

                message: "Login successful",

                student: student

            });

        }
    );

});


// ==========================================
// GET ALL STUDENTS
// ==========================================

app.get("/api/students", (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            roll_number,
            email,
            branch,
            specialization,
            cgpa,
            skills,
            created_at
        FROM students
        ORDER BY id DESC
    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Failed to get students"
            });

        }

        res.json(results);

    });

});


// ==========================================
// SUBMIT APPLICATION
// ==========================================

app.post("/api/applications", (req, res) => {

    const {
        student_id,
        company_id,
        technical_domain,
        technical_skills,
        resume_name,
        certificate_name,
        project_links,
        candidate_type
    } = req.body;


    if (!student_id || !company_id) {

        return res.status(400).json({
            message:
                "Student and company are required"
        });

    }


    // Check whether already applied

    const checkSql = `
        SELECT id
        FROM applications
        WHERE student_id = ?
          AND company_id = ?
    `;


    db.query(
        checkSql,
        [student_id, company_id],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }


            if (results.length > 0) {

                return res.status(409).json({
                    message:
                        "You have already applied for this company"
                });

            }


            const insertSql = `
                INSERT INTO applications
                (
                    student_id,
                    company_id,
                    technical_domain,
                    technical_skills,
                    resume_name,
                    certificate_name,
                    project_links,
                    candidate_type,
                    status,
                    round
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                insertSql,
                [
                    student_id,
                    company_id,
                    technical_domain || "",
                    technical_skills || "",
                    resume_name || "",
                    certificate_name || "",
                    project_links || "",
                    candidate_type || "Fresher",
                    "Applied",
                    "Application Submitted"
                ],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message:
                                "Application submission failed"
                        });

                    }


                    res.status(201).json({

                        message:
                            "Application submitted successfully",

                        application_id:
                            result.insertId

                    });

                }
            );

        }
    );

});


// ==========================================
// GET ALL APPLICATIONS
// ==========================================

app.get("/api/applications", (req, res) => {

    const sql = `
        SELECT
            applications.*,

            students.name AS student_name,
            students.roll_number,
            students.email,

            companies.company_name,
            companies.job_role

        FROM applications

        JOIN students
            ON applications.student_id = students.id

        JOIN companies
            ON applications.company_id = companies.id

        ORDER BY applications.id DESC
    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message:
                    "Failed to get applications"
            });

        }

        res.json(results);

    });

});


// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

app.put(
    "/api/applications/:id/status",
    (req, res) => {

        const applicationId =
            req.params.id;

        const {
            status,
            round
        } = req.body;


        if (!status || !round) {

            return res.status(400).json({
                message:
                    "Status and round are required"
            });

        }


        const sql = `
            UPDATE applications

            SET
                status = ?,
                round = ?

            WHERE id = ?
        `;


        db.query(
            sql,
            [status, round, applicationId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message:
                            "Failed to update application"
                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message:
                            "Application not found"
                    });

                }


                res.json({

                    message:
                        "Application status updated successfully"

                });

            }
        );

    }
);


// ==========================================
// DELETE COMPANY
// ==========================================

app.delete(
    "/api/companies/:id",
    (req, res) => {

        const companyId =
            req.params.id;


        const sql = `
            DELETE FROM companies
            WHERE id = ?
        `;


        db.query(
            sql,
            [companyId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message:
                            "Failed to delete company"
                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message:
                            "Company not found"
                    });

                }


                res.json({

                    message:
                        "Company deleted successfully"

                });

            }
        );

    }
);
// ==========================================
// ADD COMPANY
// ==========================================

app.post("/api/companies", (req, res) => {

    const {
        company_name,
        job_role,
        package,
        eligible_branches,
        minimum_cgpa,
        required_skills,
        location,
        deadline
    } = req.body;

    if (!company_name || !job_role) {

        return res.status(400).json({
            message: "Company name and job role are required"
        });

    }

    const sql = `
        INSERT INTO companies
        (
            company_name,
            job_role,
            package,
            eligible_branches,
            minimum_cgpa,
            required_skills,
            location,
            deadline
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            company_name,
            job_role,
            package || "",
            eligible_branches || "",
            minimum_cgpa || null,
            required_skills || "",
            location || "",
            deadline || null
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Failed to add company"
                });

            }

            res.status(201).json({
                message: "Company added successfully",
                company_id: result.insertId
            });

        }
    );

});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("=================================");
    console.log("MITS Placement Portal");
    console.log(`Website: http://localhost:${PORT}`);
    console.log("=================================");
    console.log("");
});