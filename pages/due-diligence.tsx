import DueDiligencePage from '../src/components/DueDiligencePage';
export default function DueDiligenceRoute() {
  return <DueDiligencePage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
