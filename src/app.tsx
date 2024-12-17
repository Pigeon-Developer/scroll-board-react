import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { SortableItem } from "./sortable-item";
import { $problems, $teams } from "./state";
import { mockScoreChange, prepareMockData } from "./mock";
import "./app.css";
import "./header.less";

prepareMockData();

function RenderHeader() {
  const problems = useStore($problems);
  return (
    <div className="header">
      <div className="col">rank</div>
      <div className="col">ID</div>
      <div className="col">解决</div>
      <div className="col">惩罚</div>
      {problems.map((it) => (
        <div className="col" key={it.key}>
          {it.name}
        </div>
      ))}
    </div>
  );
}

function RenderContent() {
  const teams = useStore($teams);

  return (
    <div className="list-content">
      {teams.map((team) => (
        <SortableItem key={team.id} id={team.id} />
      ))}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    return mockScoreChange();
  }, []);

  return (
    <div>
      <RenderHeader />
      <RenderContent />
    </div>
  );
}
