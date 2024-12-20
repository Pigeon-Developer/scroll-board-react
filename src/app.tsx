import { useEffect } from "react";
import { DndContext, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useStore } from "@nanostores/react";
import { SortableItem } from "./sortable-item";
import { ApiSensor } from "./api-control";
import { $problems, $teams } from "./state";
import { mockScoreChange, prepareMockData } from "./mock";
import "./header.less";

prepareMockData();

function handleDragEnd() {
  const teams = $teams.get();
  const next = teams.slice();
  next.sort((a, b) => {
    return a.rank - b.rank;
  });

  $teams.set(next);
}

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
  const sensors = useSensors(useSensor(ApiSensor));
  const teams = useStore($teams);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={teams} strategy={verticalListSortingStrategy}>
        {teams.map((team) => (
          <SortableItem key={team.id} id={team.id} />
        ))}
      </SortableContext>
    </DndContext>
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
