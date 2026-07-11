import { NextResponse } from 'next/server';
import { REAL_UNIVERSITIES } from './data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const country = searchParams.get('country')?.toLowerCase() || '';
  const type = searchParams.get('type')?.toLowerCase() || '';
  const maxTuitionParam = searchParams.get('maxTuition');

  let results = REAL_UNIVERSITIES;

  if (q) {
    results = results.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.city.toLowerCase().includes(q)
    );
  }

  if (country) {
    results = results.filter(u => u.country.toLowerCase() === country);
  }

  if (type) {
    results = results.filter(u => u.type.toLowerCase() === type);
  }

  if (maxTuitionParam) {
    const maxTuition = parseInt(maxTuitionParam, 10);
    if (!isNaN(maxTuition)) {
      results = results.filter(u => u.tuitionFee !== undefined && u.tuitionFee <= maxTuition);
    }
  }

  return NextResponse.json(results);
}
