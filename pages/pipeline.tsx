import PipelinePage from '../src/components/PipelinePage';
export default function PipelineRoute() {
  return <PipelinePage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
