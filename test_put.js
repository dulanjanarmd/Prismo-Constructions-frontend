const test = async () => {
    try {
        const loginRes = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'client@company.com', password: 'password123' })
        });
        const data = await loginRes.json();
        const token = data.token;
        console.log("Token:", token.substring(0, 10));

        const putRes = await fetch('http://localhost:8080/api/client/approvals/1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                status: 'CHANGES_REQUESTED',
                auditTrail: [{ 'actor': 'Nanayakkara', 'action': 'Changes Requested', 'timestamp': '9/15', 'type': 'changes' }]
            })
        });
        const text = await putRes.text();
        console.log("PUT Response:", text);
    } catch (err) {
        console.error(err);
    }
};
test();
