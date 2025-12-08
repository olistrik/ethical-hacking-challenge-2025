import { useEffect } from "react";
import { Navigate, redirect } from "react-router-dom";
import { gql, useQuery } from "urql"

const NotesQuery = gql`
	query {
		myNotes {
			name
			body
		}
	}
`

export function Notes() {
    const [{ data, fetching, error }] = useQuery({ query: NotesQuery });

    if (fetching) return <></>;


    if (!data || error) {
        return <Navigate to="/login" replace />;
    }

    return (<>
        <div className="notes">
            {data.myNotes.map(({ name, body }) =>
                <div key={name} className="note">
                    <div>{name}</div>
                    <div>{body}</div>
                </div>
            )}
        </div>
    </>)
}
