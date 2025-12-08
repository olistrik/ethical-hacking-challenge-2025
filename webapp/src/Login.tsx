import { password } from "bun";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "urql";

const LoginMutation = gql`
	mutation ($email: String!, $password: String!) {
		login(email: $email, password: $password)
	}
`;

export function Login() {
    let navigate = useNavigate();
    const [loginResult, login] = useMutation(LoginMutation);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const result = await login({ email, password });

        if (result.error) {
            setError(result.error.graphQLErrors[0]?.message ?? "");
            return;
        }

        navigate("/");
    }

    return (<>
        <h1>My Notes</h1>
        {error.length > 0 && <p>{error}</p>}
        <div className="api-tester">
            <form onSubmit={onSubmit} className="endpoint-row">
                <input
                    type="text"
                    className="url-input"
                    placeholder="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="url-input"
                    placeholder="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>
        </div>
    </>)
}
