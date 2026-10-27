// Vercel 서버리스 함수: 환경변수 PIXABAY_API_KEY 로 Pixabay 를 대신 호출합니다.
// 키는 서버에서만 사용되고 브라우저로 전달되지 않습니다.
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    return res.status(500).json({ error: '서버에 PIXABAY_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  const q = String(req.query.q || '').trim().slice(0, 100);
  if (!q) {
    return res.status(400).json({ error: '검색어를 입력하세요.' });
  }

  const url =
    'https://pixabay.com/api/?key=' + encodeURIComponent(key) +
    '&q=' + encodeURIComponent(q) +
    '&image_type=photo&per_page=10&safesearch=true&lang=ko';

  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ error: 'Pixabay 요청 실패 (' + r.status + ')' });
    }
    const data = await r.json();
    const hits = (data.hits || []).map(h => ({
      id: h.id,
      tags: h.tags,
      user: h.user,
      pageURL: h.pageURL,
      previewURL: h.previewURL,
      webformatURL: h.webformatURL,
    }));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ hits });
  } catch (e) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
