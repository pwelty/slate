90:// Joplin API endpoint
91-app.get('/api/joplin/recent', async (req, res) => {
92-  try {
93-    const data = await getCachedData('joplin', async () => {
94-      const token = process.env.JOPLIN_TOKEN
95-      const baseUrl = process.env.JOPLIN_URL || 'https://joplin.squirrel-corn.ts.net'
96-      const limit = req.query.limit || 3
97-      
98-      if (!token) {
99-        throw new Error('JOPLIN_TOKEN not set')
100-      }
101-      
102-      // Joplin Server API - try different authentication methods
103-      let response = await fetch(`${baseUrl}/api/items?token=${token}&order_by=updated_time&order_dir=DESC&limit=${limit}&type=1`)
104-      
105-      // If token in URL doesn't work, try Authorization header
106-      if (!response.ok) {
107-        response = await fetch(`${baseUrl}/api/items?order_by=updated_time&order_dir=DESC&limit=${limit}&type=1`, {
108-          headers: {
109-            'Authorization': `Bearer ${token}`,
110-            'Content-Type': 'application/json'
111-          }
112-        })
113-      }
114-      
115-      if (!response.ok) {
116-        throw new Error(`Joplin API error: ${response.status}`)
117-      }
118-      
119-      const data = await response.json()
120-      
121-      return data.items?.map(item => ({
122-        title: item.title,
123-        description: item.body ? item.body.substring(0, 100) + '...' : '',
124-        url: `joplin://note/${item.id}`, // Simpler desktop app protocol
125-        date: item.updated_time,
126-        tags: []
127-      })) || []
128-    })
129-    
130-    res.json(data)
131-  } catch (error) {
132-    console.error('Joplin API error:', error)
133-    res.json([]) // Return empty array instead of mock data
134-  }
135-})
136-
137-// Health check
138-app.get('/health', (req, res) => {
139-  res.json({ status: 'ok', cache_size: cache.size })
140-})
