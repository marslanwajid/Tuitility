'use client';

import React, { useState, useCallback, useRef } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const commonWordsBritish: Record<string, string> = {
  'hello': 'hɛˈləʊ', 'world': 'wɜːld', 'the': 'ðə', 'a': 'ə', 'an': 'ən', 'and': 'ænd',
  'is': 'ɪz', 'are': 'ɑː', 'to': 'tuː', 'of': 'ɒv', 'for': 'fɔː', 'in': 'ɪn', 'on': 'ɒn',
  'at': 'æt', 'with': 'wɪð', 'by': 'baɪ', 'from': 'frɒm', 'about': 'əˈbaʊt', 'into': 'ˈɪntuː',
  'over': 'ˈəʊvə', 'after': 'ˈɑːftə', 'under': 'ˈʌndə', 'through': 'θruː', 'between': 'bɪˈtwiːn',
  'yes': 'jɛs', 'no': 'nəʊ', 'please': 'pliːz', 'thank': 'θæŋk', 'you': 'juː', 'sorry': 'ˈsɒri',
  'what': 'wɒt', 'where': 'weə', 'when': 'wɛn', 'why': 'waɪ', 'who': 'huː', 'how': 'haʊ',
  'which': 'wɪtʃ', 'there': 'ðeə', 'here': 'hɪə', 'this': 'ðɪs', 'that': 'ðæt', 'these': 'ðiːz',
  'those': 'ðəʊz', 'they': 'ðeɪ', 'them': 'ðɛm', 'their': 'ðeə', 'she': 'ʃiː', 'he': 'hiː',
  'it': 'ɪt', 'we': 'wiː', 'i': 'aɪ', 'me': 'miː', 'my': 'maɪ', 'your': 'jɔː', 'his': 'hɪz',
  'her': 'hɜː', 'our': 'aʊə', 'its': 'ɪts', 'good': 'gʊd', 'bad': 'bæd', 'big': 'bɪg',
  'small': 'smɔːl', 'high': 'haɪ', 'low': 'ləʊ', 'long': 'lɒŋ', 'short': 'ʃɔːt', 'new': 'njuː',
  'old': 'əʊld', 'young': 'jʌŋ', 'happy': 'ˈhæpi', 'sad': 'sæd', 'time': 'taɪm', 'day': 'deɪ',
  'night': 'naɪt', 'year': 'jɪə', 'month': 'mʌnθ', 'week': 'wiːk', 'today': 'təˈdeɪ',
  'tomorrow': 'təˈmɒrəʊ', 'yesterday': 'ˈjɛstədeɪ', 'now': 'naʊ', 'then': 'ðɛn', 'always': 'ˈɔːlweɪz',
  'never': 'ˈnɛvə', 'sometimes': 'ˈsʌmtaɪmz', 'often': 'ˈɒfn', 'usually': 'ˈjuːʒuəli',
  'one': 'wʌn', 'two': 'tuː', 'three': 'θriː', 'four': 'fɔː', 'five': 'faɪv', 'six': 'sɪks',
  'seven': 'ˈsɛvn', 'eight': 'eɪt', 'nine': 'naɪn', 'ten': 'tɛn', 'hundred': 'ˈhʌndrəd',
  'thousand': 'ˈθaʊzənd', 'million': 'ˈmɪljən', 'billion': 'ˈbɪljən'
};

const commonWordsAmerican: Record<string, string> = {
  'the': 'ðə', 'a': 'ə', 'an': 'ən', 'and': 'ænd', 'is': 'ɪz', 'are': 'ɑr', 'to': 'tu',
  'of': 'əv', 'for': 'fɔr', 'in': 'ɪn', 'on': 'ɑn', 'at': 'æt', 'with': 'wɪð', 'by': 'baɪ',
  'from': 'frəm', 'about': 'əˈbaʊt', 'into': 'ˈɪntu', 'over': 'ˈoʊvər', 'after': 'ˈæftər',
  'under': 'ˈʌndər', 'through': 'θru', 'between': 'bɪˈtwin', 'hello': 'həˈloʊ',
  'goodbye': 'ˌgʊdˈbaɪ', 'yes': 'jɛs', 'no': 'noʊ', 'please': 'pliz', 'thank': 'θæŋk',
  'you': 'ju', 'sorry': 'ˈsɑri', 'what': 'wət', 'where': 'wɛr', 'when': 'wɛn', 'why': 'waɪ',
  'who': 'hu', 'how': 'haʊ', 'which': 'wɪtʃ', 'there': 'ðɛr', 'here': 'hɪr', 'this': 'ðɪs',
  'that': 'ðæt', 'these': 'ðiz', 'those': 'ðoʊz', 'they': 'ðeɪ', 'them': 'ðɛm', 'their': 'ðɛr',
  'she': 'ʃi', 'he': 'hi', 'it': 'ɪt', 'we': 'wi', 'i': 'aɪ', 'me': 'mi', 'my': 'maɪ',
  'your': 'jɔr', 'his': 'hɪz', 'her': 'hɜr', 'our': 'aʊr', 'its': 'ɪts', 'quick': 'kwɪk',
  'brown': 'braʊn', 'fox': 'fɑks', 'jumps': 'dʒʌmps', 'lazy': 'ˈleɪzi', 'dog': 'dɔg'
};

function countSyllables(word: string): number {
  return (word.match(/[aeiouæɑɒəɛɪɔʊʌ]/g) || []).length;
}

function applyBritishRules(word: string): string {
  return word
    .replace(/th(?=[aeiou])/g, 'ð').replace(/th/g, 'θ')
    .replace(/ch/g, 'tʃ').replace(/sh/g, 'ʃ').replace(/zh/g, 'ʒ')
    .replace(/ng/g, 'ŋ').replace(/ph/g, 'f')
    .replace(/gh/g, '').replace(/wh/g, 'w')
    .replace(/ck/g, 'k').replace(/kn/g, 'n')
    .replace(/mb$/g, 'm').replace(/ps/g, 's')
    .replace(/gn/g, 'n').replace(/wr/g, 'r').replace(/qu/g, 'kw')
    .replace(/ee/g, 'iː').replace(/ea(?=d\b)/g, 'ɛ').replace(/ea(?=th)/g, 'ɛ')
    .replace(/ea/g, 'iː').replace(/ei(?=gh)/g, 'eɪ').replace(/ei/g, 'aɪ')
    .replace(/ey(?=\b)/g, 'iː').replace(/ey/g, 'eɪ')
    .replace(/ie(?=\b)/g, 'iː').replace(/ie/g, 'aɪ').replace(/igh/g, 'aɪ')
    .replace(/oo(?=k)/g, 'ʊ').replace(/oo(?=d)/g, 'ʊ').replace(/oo/g, 'uː')
    .replace(/ou(?=gh\b)/g, 'ɔː').replace(/ou(?=ld)/g, 'ʊ').replace(/ou(?=l)/g, 'əʊ')
    .replace(/ou/g, 'aʊ').replace(/ow(?=\b)/g, 'əʊ').replace(/ow/g, 'aʊ')
    .replace(/oy/g, 'ɔɪ').replace(/oi/g, 'ɔɪ')
    .replace(/ai/g, 'eɪ').replace(/ay/g, 'eɪ')
    .replace(/aw/g, 'ɔː').replace(/au/g, 'ɔː')
    .replace(/oa/g, 'əʊ').replace(/oe/g, 'əʊ')
    .replace(/a(?=\w*[^aeiou][^aeiou]\b)/g, 'æ').replace(/a(?=[^aeiou]\b)/g, 'æ')
    .replace(/a(?=\w*[^aeiou]e\b)/g, 'eɪ').replace(/a/g, 'ə')
    .replace(/e(?=\w*[^aeiou][^aeiou]\b)/g, 'ɛ').replace(/e(?=[^aeiou]\b)/g, 'ɛ')
    .replace(/e(?=\b)/g, '').replace(/e/g, 'ə')
    .replace(/i(?=\w*[^aeiou][^aeiou]\b)/g, 'ɪ').replace(/i(?=[^aeiou]\b)/g, 'ɪ')
    .replace(/i(?=\w*[^aeiou]e\b)/g, 'aɪ').replace(/i/g, 'ɪ')
    .replace(/o(?=\w*[^aeiou][^aeiou]\b)/g, 'ɒ').replace(/o(?=[^aeiou]\b)/g, 'ɒ')
    .replace(/o(?=\w*[^aeiou]e\b)/g, 'əʊ').replace(/o/g, 'ə')
    .replace(/u(?=\w*[^aeiou][^aeiou]\b)/g, 'ʌ').replace(/u(?=[^aeiou]\b)/g, 'ʌ')
    .replace(/u(?=\w*[^aeiou]e\b)/g, 'juː').replace(/u/g, 'ə')
    .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k')
    .replace(/g(?=[eiy])/g, 'dʒ').replace(/x/g, 'ks').replace(/q(?!u)/g, 'k');
}

function applyAmericanRules(word: string): string {
  return word
    .replace(/th(?=[aeiou])/g, 'ð').replace(/th/g, 'θ')
    .replace(/ch/g, 'tʃ').replace(/sh/g, 'ʃ').replace(/zh/g, 'ʒ')
    .replace(/ng/g, 'ŋ').replace(/ph/g, 'f')
    .replace(/gh/g, '').replace(/wh/g, 'w')
    .replace(/ck/g, 'k').replace(/kn/g, 'n')
    .replace(/mb$/g, 'm').replace(/ps/g, 's')
    .replace(/gn/g, 'n').replace(/wr/g, 'r').replace(/qu/g, 'kw')
    .replace(/ee/g, 'i').replace(/ea(?=d\b)/g, 'ɛ').replace(/ea(?=th)/g, 'ɛ')
    .replace(/ea/g, 'i').replace(/ei(?=gh)/g, 'eɪ').replace(/ei/g, 'aɪ')
    .replace(/ey(?=\b)/g, 'i').replace(/ey/g, 'eɪ')
    .replace(/ie(?=\b)/g, 'i').replace(/ie/g, 'aɪ').replace(/igh/g, 'aɪ')
    .replace(/oo(?=k)/g, 'ʊ').replace(/oo(?=d)/g, 'ʊ').replace(/oo/g, 'u')
    .replace(/ou(?=gh\b)/g, 'ɔ').replace(/ou(?=ld)/g, 'ʊ').replace(/ou(?=l)/g, 'oʊ')
    .replace(/ou/g, 'aʊ').replace(/ow(?=\b)/g, 'oʊ').replace(/ow/g, 'aʊ')
    .replace(/oy/g, 'ɔɪ').replace(/oi/g, 'ɔɪ')
    .replace(/ai/g, 'eɪ').replace(/ay/g, 'eɪ')
    .replace(/aw/g, 'ɔ').replace(/au/g, 'ɔ')
    .replace(/oa/g, 'oʊ').replace(/oe/g, 'oʊ')
    .replace(/a(?=\w*[^aeiou][^aeiou]\b)/g, 'æ').replace(/a(?=[^aeiou]\b)/g, 'æ')
    .replace(/a(?=\w*[^aeiou]e\b)/g, 'eɪ').replace(/a/g, 'ə')
    .replace(/e(?=\w*[^aeiou][^aeiou]\b)/g, 'ɛ').replace(/e(?=[^aeiou]\b)/g, 'ɛ')
    .replace(/e(?=\b)/g, '').replace(/e/g, 'ə')
    .replace(/i(?=\w*[^aeiou][^aeiou]\b)/g, 'ɪ').replace(/i(?=[^aeiou]\b)/g, 'ɪ')
    .replace(/i(?=\w*[^aeiou]e\b)/g, 'aɪ').replace(/i/g, 'ɪ')
    .replace(/o(?=\w*[^aeiou][^aeiou]\b)/g, 'ɑ').replace(/o(?=[^aeiou]\b)/g, 'ɑ')
    .replace(/o(?=\w*[^aeiou]e\b)/g, 'oʊ').replace(/o/g, 'ə')
    .replace(/u(?=\w*[^aeiou][^aeiou]\b)/g, 'ʌ').replace(/u(?=[^aeiou]\b)/g, 'ʌ')
    .replace(/u(?=\w*[^aeiou]e\b)/g, 'ju').replace(/u/g, 'ə')
    .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k')
    .replace(/g(?=[eiy])/g, 'dʒ').replace(/x/g, 'ks').replace(/q(?!u)/g, 'k');
}

function englishToIPA(text: string, accent: string): string {
  const dict = accent === 'british' ? commonWordsBritish : commonWordsAmerican;
  const rules = accent === 'british' ? applyBritishRules : applyAmericanRules;
  return text.split(/\s+/).map(word => {
    const lead = word.match(/^[.,/#!$%^&*;:{}=\-_`~()'"]+/) || [''];
    const trail = word.match(/[.,/#!$%^&*;:{}=\-_`~()'"]+$/) || [''];
    const clean = word.replace(/^[.,/#!$%^&*;:{}=\-_`~()'"]+|[.,/#!$%^&*;:{}=\-_`~()'"]+$/g, '');
    if (!clean) return word;
    if (dict[clean]) return lead[0] + dict[clean] + trail[0];
    let ipa = rules(clean);
    if (countSyllables(ipa) > 1 && !ipa.includes('ˈ')) ipa = 'ˈ' + ipa;
    if (accent === 'british') ipa = ipa.replace(/ɑ(?=r)/g, 'ɑː').replace(/ɔ(?=[^ɪ])/g, 'ɔː').replace(/ɜ/g, 'ɜː');
    return lead[0] + ipa + trail[0];
  }).join(' ');
}

function ipaToEnglish(text: string): string {
  const reverse: Record<string, string> = {};
  for (const dict of [commonWordsBritish, commonWordsAmerican]) {
    for (const [word, ipa] of Object.entries(dict)) {
      reverse[ipa] = word;
    }
  }
  return text.split(/\s+/).map(ipaWord => {
    if (reverse[ipaWord]) return reverse[ipaWord];
    return ipaWord
      .replace(/ˈ/g, '').replace(/ˌ/g, '')
      .replace(/θ/g, 'th').replace(/ð/g, 'th')
      .replace(/ʃ/g, 'sh').replace(/tʃ/g, 'ch')
      .replace(/dʒ/g, 'j').replace(/ŋ/g, 'ng').replace(/ʒ/g, 'zh')
      .replace(/æ/g, 'a').replace(/ɑː/g, 'ar').replace(/ɑ/g, 'a')
      .replace(/ɒ/g, 'o').replace(/ɔː/g, 'or').replace(/ɔ/g, 'o')
      .replace(/eə/g, 'are').replace(/ɪə/g, 'ear').replace(/ʊə/g, 'ure')
      .replace(/eɪ/g, 'ay').replace(/ɛ/g, 'e')
      .replace(/iː/g, 'ee').replace(/i/g, 'ee').replace(/ɪ/g, 'i')
      .replace(/aɪ/g, 'igh').replace(/ɜː/g, 'er').replace(/ɜr/g, 'er')
      .replace(/əʊ/g, 'ow').replace(/oʊ/g, 'ow').replace(/ɔɪ/g, 'oy')
      .replace(/uː/g, 'oo').replace(/u/g, 'oo').replace(/ʊ/g, 'oo')
      .replace(/aʊ/g, 'ow').replace(/ʌ/g, 'u').replace(/ə/g, 'a');
  }).join(' ');
}

export default function EnglishToIpaTranslator() {
  const [mode, setMode] = useState<'to-ipa' | 'to-english'>('to-ipa');
  const [accent, setAccent] = useState<'british' | 'american'>('british');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeech = useCallback(() => {
    speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speakText = useCallback((text: string, selectedAccent: string) => {
    if (!text.trim()) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    const voices = speechSynthesis.getVoices();
    const lang = selectedAccent === 'british' ? 'en-GB' : 'en-US';
    const voice = voices.find((v) => v.lang.startsWith(lang)) || null;
    if (voice) utterance.voice = voice;
    utterance.lang = lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  }, [stopSpeech]);

  const handleSpeakInput = useCallback(() => {
    if (speaking) { stopSpeech(); return; }
    speakText(input, accent);
  }, [input, accent, speaking, speakText, stopSpeech]);

  const handleSpeakOutput = useCallback(() => {
    if (speaking) { stopSpeech(); return; }
    const text = mode === 'to-ipa' ? input : output;
    speakText(text, accent);
  }, [input, output, mode, accent, speaking, speakText, stopSpeech]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const handleConvert = useCallback(() => {
    if (!input.trim()) return;
    try {
      const result = mode === 'to-ipa' ? englishToIPA(input, accent) : ipaToEnglish(input);
      setOutput(result);
      addToast('Conversion complete!', 'success');
    } catch {
      addToast('Conversion failed. Check your input.', 'error');
    }
  }, [input, mode, accent, addToast]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      addToast('Copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy.', 'error');
    }
  }, [output, addToast]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'to-ipa' ? 'ipa-transcription.txt' : 'english-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, mode]);

  const inputLabel = mode === 'to-ipa' ? 'English Text' : 'IPA Text';
  const outputLabel = mode === 'to-ipa' ? 'IPA Transcription' : 'English Text';
  const inputPlaceholder = mode === 'to-ipa' ? 'Type English text here...' : 'Type IPA symbols here...';
  const inputStats = `Chars: ${input.length}  Words: ${input.trim() ? input.trim().split(/\s+/).length : 0}  Lines: ${input ? input.split('\n').length : 0}`;
  const outputStats = `Chars: ${output.length}  Words: ${output.trim() ? output.trim().split(/\s+/).length : 0}  Lines: ${output ? output.split('\n').length : 0}`;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">IPA</span>
        </div>
        <i className="fas fa-microphone-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security Guard</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All conversion and speech happens locally in your browser. No content ever leaves your device.
          </p>
        </div>
      </div>

      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${
                t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">IPA</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          {/* Mode + Accent Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-white/5 rounded-xl p-1.5 border border-white/10">
            <button
              onClick={() => { setMode('to-ipa'); setOutput(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'to-ipa' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fas fa-language mr-1"></i>English → IPA
            </button>
            <button
              onClick={() => { setMode('to-english'); setOutput(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'to-english' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fas fa-microphone mr-1"></i>IPA → English
            </button>
            {mode === 'to-ipa' && (
              <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Accent:</span>
                <button
                  onClick={() => setAccent('british')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                    accent === 'british' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇬🇧 UK
                </button>
                <button
                  onClick={() => setAccent('american')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                    accent === 'american' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇺🇸 US
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span><i className="fas fa-arrow-right-to-bracket mr-1"></i>{inputLabel}</span>
              <span className="text-[10px] text-slate-500">{inputStats}</span>
            </label>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30 resize-y min-h-[200px] max-h-[400px] placeholder:text-white/20"
            />
          </div>

          {/* Convert + Speak Input */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleConvert}
              disabled={!input.trim()}
              className="px-8 py-3 rounded-xl bg-white text-[#1a1a1a] text-sm font-black hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              <i className="fas fa-sync-alt mr-2"></i>Convert
            </button>
            <button
              onClick={handleSpeakInput}
              disabled={!input.trim()}
              className={`px-5 py-3 rounded-xl text-sm font-black transition-colors shadow-lg ${
                speaking
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <i className={`fas ${speaking ? 'fa-stop' : 'fa-volume-up'} mr-2`}></i>{speaking ? 'Stop' : 'Speak Input'}
            </button>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span><i className="fas fa-arrow-right-from-bracket mr-1"></i>{outputLabel}</span>
              <span className="text-[10px] text-slate-500">{outputStats}</span>
            </label>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                placeholder="Result will appear here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono resize-y min-h-[200px] max-h-[400px] placeholder:text-white/20 cursor-default"
              />
              {output && (
                <button
                  onClick={handleSpeakOutput}
                  className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    speaking
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <i className={`fas ${speaking ? 'fa-stop' : 'fa-volume-up'} mr-1`}></i>{speaking ? 'Stop' : 'Speak'}
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleClear}
              disabled={!input && !output}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-eraser mr-1"></i>Clear
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-copy mr-1"></i>Copy Output
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-download mr-1"></i>Download
            </button>
            <button
              onClick={() => setShowChart((p) => !p)}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              <i className={`fas ${showChart ? 'fa-chevron-up' : 'fa-table'} mr-1`}></i>{showChart ? 'Hide' : 'Show'} IPA Chart
            </button>
          </div>

          {/* IPA Reference Chart */}
          {showChart && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                <i className="fas fa-table mr-1"></i>IPA Symbol Reference
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <h4 className="text-[11px] font-bold text-slate-300 mb-2">Short Vowels</h4>
                  <div className="space-y-1 text-[12px] text-slate-400 font-mono">
                    <div><span className="text-white font-bold">ɪ</span> (b<span className="text-white">i</span>t)</div>
                    <div><span className="text-white font-bold">ɛ</span> (b<span className="text-white">e</span>t)</div>
                    <div><span className="text-white font-bold">æ</span> (c<span className="text-white">a</span>t)</div>
                    <div><span className="text-white font-bold">ɒ</span> (h<span className="text-white">o</span>t, UK)</div>
                    <div><span className="text-white font-bold">ʌ</span> (c<span className="text-white">u</span>t)</div>
                    <div><span className="text-white font-bold">ʊ</span> (p<span className="text-white">u</span>t)</div>
                    <div><span className="text-white font-bold">ə</span> (<span className="text-white">a</span>bout)</div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <h4 className="text-[11px] font-bold text-slate-300 mb-2">Long Vowels</h4>
                  <div className="space-y-1 text-[12px] text-slate-400 font-mono">
                    <div><span className="text-white font-bold">iː</span> (s<span className="text-white">ee</span>)</div>
                    <div><span className="text-white font-bold">ɑː</span> (c<span className="text-white">ar</span>)</div>
                    <div><span className="text-white font-bold">ɔː</span> (d<span className="text-white">oor</span>)</div>
                    <div><span className="text-white font-bold">uː</span> (t<span className="text-white">oo</span>)</div>
                    <div><span className="text-white font-bold">ɜː</span> (h<span className="text-white">er</span>)</div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <h4 className="text-[11px] font-bold text-slate-300 mb-2">Diphthongs</h4>
                  <div className="space-y-1 text-[12px] text-slate-400 font-mono">
                    <div><span className="text-white font-bold">eɪ</span> (s<span className="text-white">ay</span>)</div>
                    <div><span className="text-white font-bold">aɪ</span> (t<span className="text-white">ime</span>)</div>
                    <div><span className="text-white font-bold">ɔɪ</span> (b<span className="text-white">oy</span>)</div>
                    <div><span className="text-white font-bold">əʊ</span> (g<span className="text-white">o</span>, UK)</div>
                    <div><span className="text-white font-bold">oʊ</span> (g<span className="text-white">o</span>, US)</div>
                    <div><span className="text-white font-bold">aʊ</span> (n<span className="text-white">ow</span>)</div>
                    <div><span className="text-white font-bold">ɪə</span> (h<span className="text-white">ere</span>)</div>
                    <div><span className="text-white font-bold">eə</span> (th<span className="text-white">ere</span>)</div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <h4 className="text-[11px] font-bold text-slate-300 mb-2">Consonants</h4>
                  <div className="space-y-1 text-[12px] text-slate-400 font-mono">
                    <div><span className="text-white font-bold">θ</span> (<span className="text-white">th</span>in)</div>
                    <div><span className="text-white font-bold">ð</span> (<span className="text-white">th</span>is)</div>
                    <div><span className="text-white font-bold">ʃ</span> (<span className="text-white">sh</span>ip)</div>
                    <div><span className="text-white font-bold">ʒ</span> (plea<span className="text-white">s</span>ure)</div>
                    <div><span className="text-white font-bold">tʃ</span> (<span className="text-white">ch</span>urch)</div>
                    <div><span className="text-white font-bold">dʒ</span> (<span className="text-white">j</span>udge)</div>
                    <div><span className="text-white font-bold">ŋ</span> (so<span className="text-white">ng</span>)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
