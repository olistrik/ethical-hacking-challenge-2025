import { gql, useQuery } from "urql";
import { APITester } from "./APITester";
import "./index.css";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import { Notes } from "./Notes";
import { Login } from "./Login";
import type { which } from "bun";
import { useState } from "react";


function HintIcon() {
    const navigate = useNavigate();

    return <>
        <div className="hint-icon" onClick={() => navigate('/hints')}>
            ?
        </div>
    </>
}

function Hint({ children }) {
    const [visible, setVisible] = useState(false);

    return <div className={`hint ${visible && "visible"}`}>
        {children}
    </div>
}

function Hints() {
    return <>
        <div className="hints">
            <div className="hint-box">
                <p>Hi There!</p>
                <p>
                    This challenge is based on a real vulnerability I discovered once at work,<br />
                    though it was abridged a little bit to make it more appropriate for this assignment...<br />
                    The hints are base64 encoded, but here's a free one;<br /><br />
                    It'll be very helpful to be able to view the application in your browser.<br />
                    You can forward connections to this website over SSH with:<br />
                    <code>ssh -L 8080:10.10.0.14:80 group-vm</code><br /><br />
                </p>
            </div>
            <div className="hint-box">
                <h3>Hint 1</h3>
                <Hint>
                    SGF2ZSB5b3Ugc2VlbiB3aGF0IGtpbmQgb2YgQVBJIHRoZSBsb2dpbiByZXF1ZXN0cyBhcmUgbWFkZSB0bz8KVGhhdCBwYXJ0aWN1bGFyIGZyYW1ld29yayBvZnRlbiBleHBvc2VzIGEgbG90IG1vcmUgYXQgaXQncyByb290IGVuZHBvaW50IHRoYW4geW91IG1pZ2h0IGV4cGVjdC4uLgpVbHRpbWF0ZWx5LCB0aGUgbGVzc29uIGhlcmUgaXMgZG9uJ3QgZXhwb3NlIGFueSBtb3JlIGFib3V0IHlvdXIgaW50ZXJuYWwgQVBJcyB0aGFuIHlvdSBoYXZlIHRvLCBhbmQgY2VydGFpbmx5IG5vdCBpbiBwcm9kdWN0aW9uLgpGYW5jeSBhdXRvLWdlbmVyYXRlZCBzd2FnZ2VyLWRvY3MgYW5kIHdoYXRub3QgYXJlIHZlcnkgaGVscGZ1bCBmb3IgZGV2ZWxvcGVycywgYW5kIHZlcnkgdmVyeSBoZWxwZnVsIGZvciBoYWNrZXJzLg==
                </Hint>
            </div>
            <div className="hint-box">
                <h3>Hint 2</h3>
                <Hint>
                    SGF2ZSB5b3UgdHJpZWQgYWxsIHRoZSBxdWVyaWVzPwpTb21lIG9mIHRoZW0gbWlnaHQgcmV0dXJuIGEgbGl0dGxlIG1vcmUgaW5mb3JtYXRpb24gdGhhbiB0aGV5IHNob3VsZC4uLgpFc3BlY2lhbGx5IHRvIHVuYXV0aGVudGljYXRlZCB1c2Vycy4uLgoKVGhlIHJlYWwgdnVsbmVyYWJpbGl0eSB3YXMgYSBsaXR0bGUgbW9yZSBudWFuY2VkIHRoYW4gdGhpcy4gCkluIHRoYXQgY2FzZSB3ZSBmb3VuZCB0aGF0IGEgdXNlciBjb3VsZCBlbGV2YXRlIGNlcnRhaW4gZGF0YWJhc2UgcXVlcmllcyBvdXRzaWRlIG9mIHRoZWlyIHNjb3BlIGJ5IHRyYXZlcnNpbmcgdGhlIGdyYXBoIHdpdGggbmVzdGVkIHF1ZXJpZXMuIApXaXRoIHRoZSB3YXkgb3VyIHJlc29sdmVycyB3b3JrZWQgb25seSB0aGUgdG9wLWxldmVsIHF1ZXJ5IGhhZCBwZXJtaXNzaW9uIGNoZWNrcy4KVGhlIG1vcmFsIGhlcmUgaXMgcXVpdGUgc2ltcGxlOiBpZiB5b3UncmUgZ29ubmEgYXV0byBnZW5lcmF0ZSBHcmFwaFFMIGZyb20geW91ciBkYXRhYmFzZSBzY2hlbWEsIG1ha2UgZGFtbiBzdXJlIHlvdSB1bmRlcnN0YW5kIHdoYXQgaXQncyBkb2luZy4KRXZlbiB0aG9yb3VnaCB1bml0IHRlc3RzIGRpZG4ndCBzYXZlIHVzIGFzIGNvbWluZyBmcm9tIGEgcmVzdCBiYWNrZ3JvdW5kIHdlIGRpZG4ndCBldmVuIGtub3cgbmVzdGVkIHF1ZXJpZXMgd2VyZSBwb3NzaWJsZS4=
                </Hint>
            </div>
            <div className="hint-box">
                <h3>Hint 3</h3>
                <Hint>
                    SSdkIGhvcGVkIHRoZSBwcmV2aW91cyB0d28gaGludHMgd291bGQgaGF2ZSBiZWVuIGVub3VnaC4KQnV0IHBlcmhhcHMgeW91J3JlIGdldHRpbmcgc3R1Y2sgb24gdGhlIHBhc3NpdmUgc2lkZSBvZiB0aGluZ3MsIHNvIGxldCBtZSBwdXQgeW91ciBtaW5kIGF0IGVhc2U7ClRoZSBzZXJ2ZXIgY3JlYXRlcyBhIG5ldyBzZXQgb2YgdXNlciBkYXRhIGZvciBlYWNoIHRlYW0gdGhhdCBjb25uZWN0cyB0byBpdC4gCkFsbCBvZiB5b3VyIHJlcXVlc3RzIGFyZSBiZWluZyBzY29wZWQgdG8gdGhhdCBkYXRhLiAKUHJvdmlkZWQgeW91IHVzZSB0aGUgQVBJIG5vcm1hbGx5IHlvdSBhcmUgZnJlZSB0byBwZXJmb3JtIGFueSBvZiB0aGUgYXZhaWxhYmxlIHF1ZXJpZXMgb3IgbXV0YXRpb25zIHRoYXQgdGhlIHNlcnZlciBleHBvc2VzLgpUaGF0IGluY2x1ZGVzIGFueSB0aGF0IHdvdWxkIGNoYW5nZSBkYXRhIG9uIHRoZSBzZXJ2ZXIuCk9mIGNvdXJzZSwgaWYgeW91IHRyeSBoYXJkIGVub3VnaCBpdCdzIHByb2JhYmx5IHBvc3NpYmxlIHRvIGVzY2FwZSB0aGUgZW5jYXBzdWxhdGlvbiBhbmQgbWVzcyB3aXRoIHRoZSBvdGhlciB0ZWFtcyAoc28gcGxlYXNlIGRvbid0KS4=
                </Hint>
            </div>
        </div>
    </>
}

export function App() {
    return (<>
        <BrowserRouter>
            <HintIcon />
            <div className="app">
                <Routes>
                    <Route path="/" element={<Notes />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/hints" element={<Hints />} />
                </Routes>
            </div>
        </BrowserRouter>
    </>
    );
}

export default App;
