import { useState, useEffect } from 'react';

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  content?: string;
  link: string;
  imageUrl?: string;
  featured?: boolean;
  category?: string;
}

export function useNewsData() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking an API call to fetch news data
    const fetchNews = async () => {
      setLoading(true);
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setNews([
        {
          id: '1',
          title: 'Tsinghua University Tops 2026 Asia Rankings',
          date: 'July 6, 2026',
          summary: 'Tsinghua retains the #1 spot, leading in research output and employer reputation. The latest metrics show an unprecedented surge in global collaboration.',
          content: 'Tsinghua University has once again secured the number one position in the 2026 Asia University Rankings. The institution saw significant growth in its research citation index and International Faculty ratios. According to the intelligence desk, Tsinghua\'s strategic partnerships with over 50 global institutions this year contributed heavily to its unparalleled academic and employer reputation scores.',
          link: '#',
          imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
          featured: true,
          category: 'Rankings Update'
        },
        {
          id: '2',
          title: 'New Medical Program Scholarships Announced in Uzbekistan',
          date: 'July 5, 2026',
          summary: 'Several top universities in Uzbekistan have introduced new scholarships for international MBBS students to foster global medical talent.',
          content: 'In a major push to attract international medical students, the Ministry of Higher Education in Uzbekistan, alongside leading medical institutes, announced a $5 Million scholarship fund. The fund will subsidize up to 50% of tuition for high-performing international students pursuing MBBS degrees, aiming to position the country as a premier destination for medical education in Central Asia.',
          link: '#',
          imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
          category: 'Scholarships'
        },
        {
          id: '3',
          title: 'Singapore Introduces AI-Focused Engineering Degrees',
          date: 'July 4, 2026',
          summary: 'NUS and NTU launch joint programs to meet the surging demand for AI professionals in the region, featuring state-of-the-art research labs.',
          content: 'Responding to the booming tech sector, the National University of Singapore (NUS) and Nanyang Technological University (NTU) have collaborated to launch specialized undergraduate degrees in Applied Artificial Intelligence. These programs integrate closely with industry partners, offering students hands-on experience in specialized AI labs and guaranteed internships with leading tech firms in Singapore.',
          link: '#',
          imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
          category: 'Academics'
        },
        {
          id: '4',
          title: 'Regional Summit on Higher Education Policy',
          date: 'July 2, 2026',
          summary: 'Education ministers from 14 Asian nations convene to discuss cross-border degree recognition and standardized accreditation.',
          content: 'The 2026 Asian Higher Education Summit concluded yesterday with a landmark agreement. Education ministers from 14 nations signed a memorandum of understanding to streamline cross-border degree recognition. This policy shift is expected to drastically increase student mobility across the region, making it easier for graduates to find employment or pursue postgraduate studies in neighboring countries without facing prolonged accreditation hurdles.',
          link: '#',
          imageUrl: 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=600&q=80',
          category: 'Policy'
        }
      ]);
      setLoading(false);
    };

    fetchNews();
  }, []);

  return { news, loading };
}
