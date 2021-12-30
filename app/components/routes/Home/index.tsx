import { Link } from "remix";

import { Button } from "../../Button";

import styles from "./styles.module.css";

export default function Index() {
    return (
        <div className={styles.container}>
            <h1>Welcome to Remix Demo</h1>
            <ul>
                <li>
                    <Link to="/about">Sample about page</Link>
                </li>
            </ul>
            <Button
                onClick={() => alert("This button is styled by css modules!")}
            >
                This is a demo button
            </Button>
        </div>
    );
}
