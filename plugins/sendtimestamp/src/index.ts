(function (e: any, i: any, t: any) {
    "use strict";
    const o = t.findByStoreName("UserStore");
    let command: () => void;

    const r = {
        onLoad: function () {
            command = i.registerCommand({
                name: "time",
                displayName: "Time",
                displayDescription: "Get the formatted timestamp",
                description: "Get the formatted timestamp",
                options: [
                    {
                        name: "time",
                        description: "The time or offset to format",
                        type: 3, // String type
                        required: true,
                        displayName: "time",
                        displayDescription: "The time (e.g., 3pm, 3:14am, +5, +4:35)",
                    },
                    {
                        name: "style",
                        description: "The format style (optional)",
                        type: 3, // String type
                        required: false,
                        displayName: "style",
                        displayDescription: "short/long (time, date, date/time, relative)",
                    },
                ],
                execute: executeCommand,
                applicationId: "-1",
                inputType: 1,
                type: 1,
            });
        },
        onUnload: function () {
            command();
        },
    };

    async function executeCommand(args: { value: string }[]): Promise<{ content: string }> {
        const timeInput = args[0].value;
        const styleInput = args[1]?.value; // Optional style argument

        let timestamp: number;

        // Check for offset input (e.g., +5, +4:35)
        const offsetMatch = timeInput.match(/^([+-]?)(\d+)(?::(\d+))?$/);
        if (offsetMatch) {
            const sign = offsetMatch[1] === '-' ? -1 : 1;
            const hours = parseInt(offsetMatch[2], 10) || 0;
            const minutes = parseInt(offsetMatch[3], 10) || 0;
            const now = new Date();
            now.setHours(now.getHours() + sign * hours);
            now.setMinutes(now.getMinutes() + sign * minutes);
            timestamp = Math.floor(now.getTime() / 1000);
        } else {
            // Check for time input (e.g., 3pm, 3:14am)
            const timeMatch = timeInput.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m)?/i);
            if (timeMatch) {
                const hours = parseInt(timeMatch[1], 10);
                const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
                const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : '';

                const now = new Date();
                now.setHours(ampm === 'pm' && hours < 12 ? hours + 12 : hours % 12);
                now.setMinutes(minutes);
                now.setSeconds(0);
                now.setMilliseconds(0);
                timestamp = Math.floor(now.getTime() / 1000);
            } else {
                return { content: "Please provide a valid time or offset." };
            }
        }

        // Default format
        let formattedTimestamp = `<t:${timestamp}>`;

        // Map style input to corresponding format letter
        let formatStyle = "";
        if (styleInput) {
            switch (styleInput.toLowerCase()) {
                case "st":
                    formatStyle = "t"; // Short time format
                    break;
                case "lt":
                    formatStyle = "T"; // Long time format
                    break;
                case "sd":
                    formatStyle = "d"; // Short date format
                    break;
                case "ld":
                    formatStyle = "D"; // Long date format
                    break;
                case "sdt":
                    formatStyle = "f"; // Short date/time format
                    break;
                case "ldt":
                    formatStyle = "F"; // Long date/time format
                    break;
                case "r":
                    formatStyle = "R"; // Relative time format
                    break;
            }
        }

        // If a valid format style is provided, append it to the timestamp
        if (formatStyle) {
            formattedTimestamp = `<t:${timestamp}:${formatStyle}>`;
        }

        return { content: `Formatted Timestamp: ${formattedTimestamp}` };
    }

    return (e.default = r), Object.defineProperty(e, "__esModule", { value: true }), e;
})({}, vendetta.commands, vendetta.metro);
