import { useEffect } from "react";
import { DndContext, closestCenter, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useStore } from "@nanostores/react";
import { SortableItem } from "./sortable-item";
import { ApiSensor, mockScoreChange } from "./api-control";
import { $teams } from "./state";
import { randomColor, randomInt } from "./util";

const initList = new Array(80).fill(0).map((_, index) => {
  return {
    id: index,
    bg: randomColor(),
    score1: randomInt(20),
    score2: randomInt(20),
    score3: randomInt(20),
    score4: randomInt(20),
  };
});

$teams.set(initList);

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  const teams = $teams.get();
  if (active.id !== over!.id) {
    const oldIndex = teams.findIndex((it) => it.id === active.id);
    const newIndex = teams.findIndex((it) => it.id === over!.id);

    $teams.set(arrayMove(teams, oldIndex, newIndex));
  }
}

export default function App() {
  const teams = useStore($teams);
  const sensors = useSensors(useSensor(ApiSensor));

  useEffect(() => {
    return mockScoreChange();
  }, []);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={teams} strategy={verticalListSortingStrategy}>
        {teams.map((team) => (
          <SortableItem key={team.id} id={team.id} item={team} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
