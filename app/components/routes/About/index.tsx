import { Link } from "remix";

import { Button } from "../../Button";

import styles from "./styles.module.css";

export default function Index() {
  return (
    <div className={styles.container}>
      <h1>Sample About page</h1>

      <ul>
        <li>
          <Link to="/">Back to home</Link>
        </li>
      </ul>
      <Button onClick={() => alert("Neat!")}>
        This is a another demo button
      </Button>
    </div>
  );
}
