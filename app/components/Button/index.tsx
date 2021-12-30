import * as React from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

export const Button = (props: any) => {
  const { children, className, ...rest } = props;
  return (
    <button className={clsx(styles.button, className)} {...rest}>
      {children}
    </button>
  );
};
