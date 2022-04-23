import React from "react";
import { Link } from "gatsby";

function BuildController(data) {
  console.log("TODO: BuildController", data);
  let next, prev, link;
  if (data?.graph?.next?.field_slug) next = `/${data?.graph?.next?.field_slug}`;
  if (data?.graph?.previous?.field_slug)
    prev = `/${data?.graph?.previous?.field_slug}`;
  return (
    <section
      key={data?.graph?.current?.id}
      className={"controller controller__view--" + data?.viewport?.key}
    >
      <div className="controller__graph">
        {next ? <Link to={next}>NEXT</Link> : ""}
        {prev ? <Link to={prev}>PREV</Link> : ""}
      </div>
    </section>
  );
}

export { BuildController };
