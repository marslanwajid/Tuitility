import { useLocation } from 'react-router-dom';
import Seo from './Seo';
import { getPageSeo, getStructuredData } from '../utils/seo';

const SeoManager = () => {
  const location = useLocation();
  const seo = getPageSeo(location.pathname);
  const structuredData = getStructuredData(location.pathname);

  return <Seo {...seo} structuredData={structuredData} />;
};

export default SeoManager;
