import React from "react";

type Props = {
  text: string;
};

export const Setting: React.FC<Props> = (props) => {
  const {text} = props;
  return <div>Setting{text}</div>;
};
