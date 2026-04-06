import AnalyzerPage from '../src/components/AnalyzerPage';
export default function AnalyzerRoute() {
  return <AnalyzerPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
