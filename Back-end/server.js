const db = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

const PORT = 5000;


function getComplaintStatus(complaintId) {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT id, subject, status FROM complaints WHERE id = ?",
            [complaintId],
            (err, results) => {
                if (err) {
                    return reject(err);
                }

                if (results.length === 0) {
                    return resolve(null);
                }

                resolve(results[0]);
            }
        );
    });
}


app.post("/register", (req, res) => {

    const { name, email, number } = req.body;

    // First check whether email or number already exists
    const checkSql = `
        SELECT * FROM users
        WHERE email = ? OR number = ?
    `;

    db.query(checkSql, [email, number], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });
        }

        // Check duplicate email
        if (result.some(user => user.email === email)) {

            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        // Check duplicate mobile number
        if (result.some(user => user.number === number)) {

            return res.status(409).json({
                message: "Mobile number is already registered"
            });
        }

        // If both are unique, insert the user
        const insertSql = `
            INSERT INTO users (name, email, number)
            VALUES (?, ?, ?)
        `;

        db.query(
            insertSql,
            [name, email, number],
            (err, result) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                res.status(201).json({
                    message: "User Registered Successfully!"
                });

            }
        );

    });

});


app.get("/users", (req, res) => {

    const sql = "SELECT * FROM users";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        res.status(200).json(result);
    });
});

app.delete("/users/:id", (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json({
            message: "User deleted successfully"
        });

    });
});

app.put("/users/:id", (req, res) => {

    const { id } = req.params;
    const { name, email, number } = req.body;

    // Check if email already belongs to another user
    const emailSql = `
        SELECT id
        FROM users
        WHERE email = ? AND id != ?
    `;

    db.query(emailSql, [email, id], (err, emailResult) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (emailResult.length > 0) {

            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        // Check if mobile number already belongs to another user
        const numberSql = `
            SELECT id
            FROM users
            WHERE number = ? AND id != ?
        `;

        db.query(numberSql, [number, id], (err, numberResult) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });
            }

            if (numberResult.length > 0) {

                return res.status(409).json({
                    message: "Mobile number is already registered"
                });
            }

            // No duplicates → update user
            const updateSql = `
                UPDATE users
                SET name = ?, email = ?, number = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [name, email, number, id],
                (err, result) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            message: "Database Error"
                        });
                    }

                    if (result.affectedRows === 0) {

                        return res.status(404).json({
                            message: "User not found"
                        });
                    }

                    res.status(200).json({
                        message: "User updated successfully"
                    });

                }
            );

        });

    });

});

app.get("/locations/states", (req, res) => {
    const sql = `
        SELECT id, name
        FROM states
        ORDER BY name ASC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.status(200).json(result);
    });
});

app.get("/locations/districts/:stateId", (req, res) => {
    const { stateId } = req.params;

    const sql = `
        SELECT id, name
        FROM districts
        WHERE state_id = ?
        ORDER BY name ASC
    `;

    db.query(sql, [stateId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.status(200).json(result);
    });
});

app.post("/complaints", (req, res) => {

    const {
        customer_name,
        mobile_number,
        customer_email,
        state,
        district,
        city,
        pincode,
        subject,
        description
    } = req.body;

    const sql = `
        INSERT INTO complaints
        (
            customer_name,
            mobile_number,
            customer_email,
            state,
            district,
            city,
            pincode,
            subject,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            customer_name,
            mobile_number,
            customer_email,
            state,
            district,
            city,
            pincode,
            subject,
            description
        ],
        async (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            // Get the ID of the newly inserted complaint
            const complaintId = result.insertId;

            let category = null;

            try {

                // Send complaint description to Ollama
                const aiResponse = await fetch("http://localhost:11434/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama3.2:3b",
                        stream: false,
                        format: "json",
                        messages: [
                            {
                                role: "system",
                                content: `You are a complaint classification assistant.
                                Classify the complaint into exactly one category:
                                Payment Issue, Technical Issue, Delivery Issue,
                                Account Issue, Service Issue, or Other.

                                Return JSON with two fields:
                                category and reason.`
                            },
                            {
                                role: "user",
                                content: description
                            }
                        ]
                    })
                });

                const aiData = await aiResponse.json();

                const aiResult = JSON.parse(aiData.message.content);

                const allowedCategories = [
                    "Payment Issue",
                    "Technical Issue",
                    "Delivery Issue",
                    "Account Issue",
                    "Service Issue",
                    "Other"
                ];

                if (allowedCategories.includes(aiResult.category)) {

                    category = aiResult.category;

                    // Save AI-generated category in MySQL
                    db.query(
                        "UPDATE complaints SET category = ? WHERE id = ?",
                        [category, complaintId],
                        (updateErr) => {
                            if (updateErr) {
                                console.log("Category update error:", updateErr);
                            }
                        }
                    );
                }

            } catch (aiError) {

                console.log("AI categorization failed:", aiError.message);

            }

            // Complaint is successful even if AI categorization fails
            return res.status(201).json({
                message: "Complaint added successfully",
                complaintId: complaintId,
                category: category
            });

        }
    );
});
app.get("/complaints", (req, res) => {

    const sql = `
        SELECT *
        FROM complaints
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        res.status(200).json(result);

    });
});

app.get("/complaints/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT *
        FROM complaints
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.length === 0) {

            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        res.status(200).json(result[0]);

    });

});



app.put("/complaints/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved",
        "Cancelled"
    ];

    // Step 1: Validate the requested status
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid complaint status"
        });
    }

    // Step 2: Get the current status
    db.query(
        "SELECT status FROM complaints WHERE id = ?",
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Complaint not found"
                });
            }

            const oldStatus = results[0].status;

            // Step 3: Protect final statuses
            if (
                oldStatus === "Resolved" ||
                oldStatus === "Cancelled"
            ) {
                return res.status(400).json({
                    message: `This complaint is already ${oldStatus.toLowerCase()}. Its status cannot be changed.`
                });
            }

            // Avoid recording an activity if the status hasn't changed
            if (oldStatus === status) {
                return res.json({
                    message: "Complaint status is already " + status
                });
            }

            // Step 4: Update the complaint status
            db.query(
                "UPDATE complaints SET status = ? WHERE id = ?",
                [status, id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Failed to update complaint status"
                        });
                    }

                    // Step 5: Save the status change in activity history
                    db.query(
                        `INSERT INTO complaint_activity
                         (complaint_id, old_status, new_status)
                         VALUES (?, ?, ?)`,
                        [id, oldStatus, status],
                        (err) => {
                            if (err) {
                                console.error(
                                    "Failed to save complaint activity:",
                                    err
                                );

                                return res.status(500).json({
                                    message: "Status updated, but activity history could not be saved."
                                });
                            }

                            return res.json({
                                message: "Complaint status updated successfully"
                            });
                        }
                    );
                }
            );
        }
    );
});

app.get("/complaints/:id/activity", (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT old_status, new_status, activity_time
         FROM complaint_activity
         WHERE complaint_id = ?
         ORDER BY activity_time DESC, id DESC`,
        [id],
        (err, results) => {
            if (err) {
                console.error("Error fetching complaint activity:", err);

                return res.status(500).json({
                    message: "Failed to fetch complaint activity"
                });
            }

            return res.json(results);
        }
    );
});



app.get("/dashboard-stats", (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'Pending' OR status IS NULL THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
        FROM complaints
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.status(200).json(result[0]);
    });
});

app.get("/locations/states", async (req, res) => {
    try {
        const response = await fetch(
            "https://pincodes.nskmultiservices.in/api/v1/states"
        );

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        res.status(200).json(data.data.states);
    } catch (error) {
        console.log("States API Error:", error);

        res.status(500).json({
            message: "Unable to fetch states"
        });
    }
});


app.get("/locations/districts/:state", async (req, res) => {
    try {
        const { state } = req.params;

        const response = await fetch(
            `https://pincodes.nskmultiservices.in/api/v1/states/${encodeURIComponent(state)}/districts`
        );

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        res.status(200).json(data.data.districts);
    } catch (error) {
        console.log("Districts API Error:", error);

        res.status(500).json({
            message: "Unable to fetch districts"
        });
    }
});



app.post("/ai/categorize-complaint", async (req, res) => {
    try {
        const { complaintId } = req.body;

        // Step 1: Validate the complaint ID.
        const id = Number(complaintId);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid complaint ID is required"
            });
        }

        // Step 2: Get the complaint from MySQL.
        db.query(
            "SELECT id, description FROM complaints WHERE id = ?",
            [id],
            async (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({
                        message: "Failed to fetch complaint"
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "Complaint not found"
                    });
                }

                try {
                    const complaint = results[0];

                    // Step 3: Ask Ollama to categorize the description.
                    const response = await fetch(
                        "http://localhost:11434/api/chat",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                model: "llama3.2:3b",
                                stream: false,
                                format: "json",
                                messages: [
                                    {
                                        role: "system",
                                        content: `You categorize customer complaints.
Choose exactly one category from:
Payment Issue, Technical Issue, Delivery Issue,
Account Issue, Service Issue, Other.

Return only a JSON object in this format:
{"category": "Payment Issue", "reason": "Brief reason"}
Do not create new categories.`
                                    },
                                    {
                                        role: "user",
                                        content: complaint.description
                                    }
                                ]
                            })
                        }
                    );

                    if (!response.ok) {
                        return res.status(502).json({
                            message: "The local AI model request failed"
                        });
                    }

                    const data = await response.json();
                    const result = JSON.parse(data.message.content);

                    const allowedCategories = [
                        "Payment Issue",
                        "Technical Issue",
                        "Delivery Issue",
                        "Account Issue",
                        "Service Issue",
                        "Other"
                    ];

                    if (!allowedCategories.includes(result.category)) {
                        return res.status(502).json({
                            message: "AI returned an invalid category"
                        });
                    }

                    // Step 4: Save the category in MySQL.
                    db.query(
                        "UPDATE complaints SET category = ? WHERE id = ?",
                        [result.category, id],
                        (updateErr) => {
                            if (updateErr) {
                                console.error("Category update error:", updateErr);
                                return res.status(500).json({
                                    message: "Failed to save complaint category"
                                });
                            }

                            // Step 5: Return the saved category.
                            return res.json({
                                complaintId: id,
                                category: result.category,
                                reason: result.reason
                            });
                        }
                    );
                } catch (error) {
                    console.error("Categorization error:", error);
                    return res.status(500).json({
                        message: "Failed to categorize complaint"
                    });
                }
            }
        );
    } catch (error) {
        console.error("AI categorization error:", error);
        return res.status(500).json({
            message: "Failed to process categorization request"
        });
    }
});



app.get("/ai/complaint-status/:id", async (req, res) => {
    try {
        const complaintId = Number(req.params.id);

        if (!Number.isInteger(complaintId) || complaintId <= 0) {
            return res.status(400).json({
                message: "A valid complaint ID is required"
            });
        }

        const complaint = await getComplaintStatus(complaintId);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        return res.json({
            id: complaint.id,
            subject: complaint.subject,
            status: complaint.status || "Pending"
        });
    } catch (error) {
        console.error("Complaint status lookup error:", error);

        return res.status(500).json({
            message: "Failed to retrieve complaint status"
        });
    }
});



app.post("/ai/assistant", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        const messages = [
            {
                role: "system",
                content: `You are an assistant for a Complaint Management System.
For questions about a complaint's status, use the
getComplaintStatus tool.
Never guess a complaint's status.
Use the tool result to answer the user clearly.
For unrelated questions, explain that you can help
with complaint status and complaint categorization.`
            },
            {
                role: "user",
                content: question
            }
        ];

        const tools = [
            {
                type: "function",
                function: {
                    name: "getComplaintStatus",
                    description:
                        "Get the actual status and subject of a complaint by its numeric ID.",
                    parameters: {
                        type: "object",
                        properties: {
                            complaintId: {
                                type: "integer",
                                description: "The complaint ID"
                            }
                        },
                        required: ["complaintId"]
                    }
                }
            }
        ];

        // Step 1: Ask the model what to do.
        const firstResponse = await fetch(
            "http://localhost:11434/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3.2:3b",
                    stream: false,
                    messages,
                    tools
                })
            }
        );

        if (!firstResponse.ok) {
            return res.status(502).json({
                message: "The local AI model request failed"
            });
        }

        const firstData = await firstResponse.json();
        const assistantMessage = firstData.message;

        // Step 2: Check whether the model requested a tool.
        const toolCall = assistantMessage?.tool_calls?.[0];

        if (!toolCall) {
            return res.json({
                answer: assistantMessage?.content ||
                    "I could not generate an answer."
            });
        }

        if (toolCall.function.name !== "getComplaintStatus") {
            return res.status(400).json({
                message: "Unsupported tool requested"
            });
        }

        const args = toolCall.function.arguments;
        const complaintId = Number(args.complaintId);

        if (!Number.isInteger(complaintId) || complaintId <= 0) {
            return res.status(400).json({
                message: "Invalid complaint ID returned by AI"
            });
        }

        // Step 3: Execute the tool against MySQL.
        const complaint = await getComplaintStatus(complaintId);

        const toolResult = complaint
            ? {
                found: true,
                id: complaint.id,
                subject: complaint.subject.trim(),
                status: complaint.status || "Pending"
            }
            : {
                found: false,
                id: complaintId,
                message: "Complaint not found"
            };

        // Step 4: Send the tool call and its result back to the model.
        messages.push(assistantMessage);

        messages.push({
            role: "tool",
            tool_name: "getComplaintStatus",
            content: JSON.stringify(toolResult)
        });

        const finalResponse = await fetch(
            "http://localhost:11434/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3.2:3b",
                    stream: false,
                    messages,
                    tools
                })
            }
        );

        if (!finalResponse.ok) {
            return res.status(502).json({
                message: "The AI could not generate the final answer"
            });
        }

        const finalData = await finalResponse.json();

        return res.json({
            answer: finalData.message?.content ||
                "I could not generate a final answer.",
            toolUsed: "getComplaintStatus",
            toolResult
        });

    } catch (error) {
        console.error("AI assistant error:", error);

        return res.status(500).json({
            message: "Failed to process the question"
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});