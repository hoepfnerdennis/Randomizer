function Side({ eyes }: { eyes: number }) {
  const _eyes = new Array(eyes).fill(<span className="dot bg-white" />);
  return (
    <li className="die-item bg-purple-700" data-side={eyes}>
      {_eyes}
    </li>
  );
}

function Dice({ id }: { id: string }) {
  return (
    <ol className={`die-list roll-${id}`} data-roll={id} id={`die-${id}`}>
      <Side eyes={1} />
      <Side eyes={2} />
      <Side eyes={3} />
      <Side eyes={4} />
      <Side eyes={5} />
      <Side eyes={6} />
    </ol>
  );
}

export default function Dices() {
  return (
    <div className="block">
      <div className="dice">
        <Dice id="1" />
        <Dice id="2" />
      </div>
    </div>
  );
}
