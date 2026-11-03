const db = require("./db");
const https = require("https");

const url =
    "https://raw.githubusercontent.com/KTBsomen/Indian-state-district-json/main/india-states-districts-latest.json";

https.get(url, (response) => {
    let data = "";

    response.on("data", (chunk) => {
        data += chunk;
    });

    response.on("end", () => {
        try {
            const locations = JSON.parse(data);

            console.log("JSON data loaded successfully.");

            db.query("SELECT id, name FROM states", (err, states) => {
                if (err) {
                    console.log("Error fetching states:", err);
                    return;
                }

                let inserted = 0;

                locations.forEach((location) => {
                    const state = states.find(
                        (item) =>
                            item.name.toLowerCase() ===
                            location.state.toLowerCase()
                    );

                    if (!state) {
                        console.log(
                            "State not found:",
                            location.state
                        );
                        return;
                    }

                    location.districts.forEach((districtName) => {
                        const sql = `
                            INSERT INTO districts (name, state_id)
                            VALUES (?, ?)
                        `;

                        db.query(
                            sql,
                            [districtName, state.id],
                            (err) => {
                                if (err) {
                                    console.log(
                                        "Error inserting:",
                                        districtName,
                                        err
                                    );
                                    return;
                                }

                                inserted++;

                                console.log(
                                    `Inserted: ${districtName} → ${state.name}`
                                );
                            }
                        );
                    });
                });

                console.log("District import started...");
            });
        } catch (error) {
            console.log("Error reading JSON:", error);
        }
    });
}).on("error", (error) => {
    console.log("Error downloading JSON:", error);
});