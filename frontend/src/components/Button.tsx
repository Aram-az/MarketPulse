import type { PropsWithChildren } from "react";
import "../index.css";

const Button = (props: PropsWithChildren) => {
  return (
    <button className="btn-futuristic-red">
      <span>{props.children}</span>
    </button>
  );
};

export default Button;
