const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));
const ChatMessage = require('../Models/ChatMessage');
const User = require('../Models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';

async function buildUserContext(userId) {
  const user = await User.findById(userId).select('name username course semester isAdmin');
  return `User Profile:\n- name: ${user?.name || ''}\n- username: ${user?.username || ''}\n- course: ${user?.course || ''}\n- semester: ${user?.semester ?? ''}\n- role: ${user?.isAdmin ? 'admin' : 'student'}`;
}

function ruleBasedHelp(message) {
  const qRaw = (message || '').toLowerCase().trim();
  const q = qRaw.replace(/\s+/g, ' ');
  const lines = [];
  const add = (arr) => arr.forEach(l => lines.push(l));

  const editDistance = (a, b) => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }
    return dp[m][n];
  };

  const fuzzyIncludes = (text, keyword) => {
    if (text.includes(keyword)) return true;
    // sliding window fuzzy match
    const k = keyword.length;
    const maxEdits = Math.max(1, Math.floor(k * 0.25));
    for (let i = 0; i <= text.length - Math.min(k, text.length); i++) {
      const window = text.slice(i, Math.min(i + k + 2, text.length));
      if (editDistance(window, keyword) <= maxEdits) return true;
    }
    return false;
  };

  const includeAny = (needles) => needles.some(n => fuzzyIncludes(q, n));

  if (includeAny(['admission form', 'fill admission', 'submit admission', 'apply admission', 'admission from', 'addmision form', 'admission fom'])) {
    add([
      'Steps to submit the Admission Form:',
      '1) Login to the portal.',
      '2) Go to Home → click “Admission Form” or open /admission.',
      '3) Fill all required details (personal, course/semester, contact, etc.).',
      '4) Click Save/Next and review your entries.',
      '5) Submit the form to proceed to document upload.',
      '',
      'After submission:',
      '• Upload required documents at /document-upload.',
      '• You can view your submission at /view-admission-details.'
    ]);
  }

  if (includeAny(['document', 'upload', 'required doc', 'docs required', 'uplaod', 'reupload', 'pending docs'])) {
    add([
      'How to upload required documents:',
      '1) Go to /document-upload.',
      '2) Select each required file (PDF/JPG as specified).',
      '3) Ensure filenames are clear and under the size limit.',
      '4) Click Upload; wait for success confirmation for each item.',
      '5) Return later to /update-pending-documents if something is pending.',
      '',
      'Common required documents include: photo, ID, marksheets, category certificates (if applicable). Check your course notice for the exact list.'
    ]);
  }

  if (includeAny(['circular', 'notice', 'announcement', 'circuler'])) {
    add([
      'Viewing circulars:',
      '1) Open /circular from the menu.',
      '2) Use filters (course/semester) if available.',
      '3) Click a circular to view or download the attached file.'
    ]);
  }

  if (includeAny(['update pending', 'pending document', 'fix document', 'reupload', 'pending doc'])) {
    add([
      'Update pending documents:',
      '1) Visit /update-pending-documents.',
      '2) The list will show any items marked pending.',
      '3) Reupload the corrected file(s) and submit.',
      '4) Check status again under the same page or /view-admission-details.'
    ]);
  }

  if (includeAny(['profile', 'name change', 'email change'])) {
    add([
      'Update profile information:',
      '1) Go to /StudentProfile.',
      '2) Edit your details and save changes.',
      '3) For locked fields, contact admin through Ask Admin in chat or visit /admin/inbox (admin side).' 
    ]);
  }

  // Intentionally no course overviews here per requirement: non "how-to in app" should go to AI model

  if (lines.length) return lines.join('\n');
  return null;
}

async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an academic assistant for a university portal. Be concise, accurate, and helpful.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('OpenRouter call failed', { status: resp.status, statusText: resp.statusText, text });
      return null;
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    return content || null;
  } catch (err) {
    console.error('OpenRouter error:', err?.message);
    return null;
  }
}

exports.askAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      const ruleText = ruleBasedHelp(message);
      if (ruleText) {
        const threadKey = `${req.user._id}:ai`;
        await ChatMessage.create({ participants: [req.user._id], from: req.user._id, role: 'user', text: message, threadKey });
        await ChatMessage.create({ participants: [req.user._id], role: 'ai', text: ruleText, threadKey });
        return res.json({ success: true, reply: ruleText });
      }
      // Try OpenRouter if available
      const systemPrompt = `You are an academic assistant for a university portal. \n- Answer questions about academics (course/semester general guidance), admissions steps, and how to use features inside the portal.\n- Be concise, step-by-step, and friendly.`;
      const userContext = await buildUserContext(req.user._id);
      const prompt = `${systemPrompt}\n\n${userContext}\n\nStudent: ${message}\nAssistant:`;
      const orText = await callOpenRouter(prompt);
      if (orText) {
        const threadKey = `${req.user._id}:ai`;
        await ChatMessage.create({ participants: [req.user._id], from: req.user._id, role: 'user', text: message, threadKey });
        await ChatMessage.create({ participants: [req.user._id], role: 'ai', text: orText, threadKey });
        return res.json({ success: true, reply: orText });
      }
      return res.status(500).json({ success: false, message: 'AI not configured' });
    }

    const userContext = await buildUserContext(req.user._id);
    const systemPrompt = `You are an academic assistant for a university portal. \n- Answer questions about academics (course/semester general guidance), admissions steps, and how to use features inside the portal (upload documents, view circulars, update pending documents).\n- If a request requires privileged data or changes to records, instruct the student to contact admin.\n- Be concise, step-by-step, and friendly.`;

    const ruleTextFirst = ruleBasedHelp(message);
    if (ruleTextFirst) {
      const threadKey = `${req.user._id}:ai`;
      await ChatMessage.create({ participants: [req.user._id], from: req.user._id, role: 'user', text: message, threadKey });
      await ChatMessage.create({ participants: [req.user._id], role: 'ai', text: ruleTextFirst, threadKey });
      return res.json({ success: true, reply: ruleTextFirst });
    }

    const prompt = `${systemPrompt}\n\n${userContext}\n\nStudent: ${message}\nAssistant:`;

    // Restrict to a single widely available model to avoid NOT_FOUND
    const candidateModels = ['gemini-2.0-flash'];
    console.log('AI model candidates (SDK):', candidateModels);

    let aiText = null;
    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, apiVersion: 'v1' });
        const result = await model.generateContent(prompt);
        aiText = result.response.text();
        console.log('AI generation succeeded with model:', modelName);
        break;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        const statusText = err?.statusText || err?.response?.statusText;
        const errorDetails = err?.response?.data || err?.message;
        console.error('AI model attempt failed:', { modelName, status, statusText, errorDetails });
        lastError = err;
        continue;
      }
    }

    if (!aiText) {
      // Final fallback: call REST API directly
      const restModels = ['gemini-1.5-flash'];
      for (const modelName of restModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
            })
          });
          if (!resp.ok) {
            const text = await resp.text();
            console.error('REST AI call failed', { modelName, status: resp.status, statusText: resp.statusText, text });
            continue;
          }
          const data = await resp.json();
          const candidate = data?.candidates?.[0];
          const parts = candidate?.content?.parts || [];
          const text = parts.map(p => p.text).join('\n').trim();
          if (text) {
            aiText = text;
            console.log('AI REST generation succeeded with model:', modelName);
            break;
          }
        } catch (err) {
          console.error('REST AI attempt error', { modelName, err: err?.message });
          continue;
        }
      }
      if (!aiText) {
        // Try OpenRouter as alternate provider before falling back
        const orText = await callOpenRouter(prompt);
        if (orText) {
          aiText = orText;
        } else {
          // Finally fall back to guided text to avoid breaking UX
          const status = lastError?.status || lastError?.response?.status;
          if (status === 404) {
            aiText = [
              'I\'m here to help with your application. However, the AI service isn\'t fully configured yet.',
              '',
              'You can still ask me things like:',
              '• How to submit the admission form',
              '• Which documents are required',
              '• How to view/download circulars',
              '• How to update pending documents',
              '',
              'Meanwhile, please contact the admin if you need immediate assistance.'
            ].join('\n');
            console.warn('AI not configured (model 404). Returning guided fallback reply.');
          } else {
            throw lastError || new Error('All AI model attempts failed');
          }
        }
      }
    }

    const threadKey = `${req.user._id}:ai`;
    await ChatMessage.create({ participants: [req.user._id], from: req.user._id, role: 'user', text: message, threadKey });
    await ChatMessage.create({ participants: [req.user._id], role: 'ai', text: aiText, threadKey });

    res.json({ success: true, reply: aiText });
  } catch (err) {
    const status = err?.status || err?.response?.status;
    const statusText = err?.statusText || err?.response?.statusText;
    const errorDetails = err?.response?.data || err?.message;
    console.error('askAI error:', { status, statusText, errorDetails });
    let message = 'AI service error';
    if (status === 404) {
      message = 'AI model not found. Try a different model name.';
    } else if (status === 401) {
      message = 'Invalid AI API key.';
    }
    res.status(500).json({ success: false, message, status, statusText, errorDetails });
  }
};

exports.askAI2 = async (req, res) => {
  try{
    
  }
}
 
exports.sendToAdmin = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message required' });
    }
    const threadKey = `${req.user._id}:admin`;
    const doc = await ChatMessage.create({
      participants: [req.user._id],
      from: req.user._id,
      role: 'user',
      text: message,
      threadKey
    });
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('sendToAdmin error:', err);
    res.status(500).json({ success: false });
  }
};

exports.listMyAdminThread = async (req, res) => {
  try {
    const threadKey = `${req.user._id}:admin`;
    const items = await ChatMessage.find({ threadKey }).sort({ createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('listMyAdminThread error:', err);
    res.status(500).json({ success: false });
  }
};

exports.listAdminThreads = async (req, res) => {
  try {
    const threads = await ChatMessage.aggregate([
      { $match: { threadKey: { $regex: /:admin$/ } } },
      { $group: { _id: '$threadKey', lastAt: { $max: '$createdAt' } } },
      { $sort: { lastAt: -1 } }
    ]);
    const withUsers = await Promise.all(threads.map(async t => {
      const studentId = t._id.split(':')[0];
      const user = await User.findById(studentId).select('name username course semester');
      return { threadKey: t._id, student: user, lastAt: t.lastAt };
    }));
    res.json({ success: true, data: withUsers });
  } catch (err) {
    console.error('listAdminThreads error:', err);
    res.status(500).json({ success: false });
  }
};

exports.getAdminThread = async (req, res) => {
  try {
    const { studentId } = req.params;
    const threadKey = `${studentId}:admin`;
    const items = await ChatMessage.find({ threadKey }).sort({ createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('getAdminThread error:', err);
    res.status(500).json({ success: false });
  }
};

exports.replyToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message required' });
    }
    const threadKey = `${studentId}:admin`;
    const doc = await ChatMessage.create({
      participants: [studentId],
      from: req.user._id,
      to: studentId,
      role: 'admin',
      text: message,
      threadKey
    });
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('replyToStudent error:', err);
    res.status(500).json({ success: false });
  }
};


