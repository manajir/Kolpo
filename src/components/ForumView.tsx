import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { ForumPost } from '../types';
import { MessageSquare, Heart, Send, Search, Users, Sparkles, AlertTriangle } from 'lucide-react';

interface ForumCommentState {
  [postId: string]: { authorName: string; content: string; createdAt: string }[];
}

export const ForumView: React.FC = () => {
  const { user, profile, forumPosts, createForumPost, toggleLikePost, triggerSimulationNotification, language } = useAppState();
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreator, setShowCreator] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<ForumPost['category']>('general');

  // Expanded post for comment viewing state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputStr, setCommentInputStr] = useState('');
  
  // Simulated thread comments indexed by postId
  const [threadComments, setThreadComments] = useState<ForumCommentState>({
    'post-1': [
      { authorName: isEn ? 'Sultana Parveen' : 'সুলতানা পারভীন', content: isEn ? 'I chewed light dry toast or puffed rice in the morning during my pregnancy. It immediately reduced nausea!' : 'আমি গর্ভকালে সকালে হালকা শুকনো টোস্ট বা মুড়ি চিবাতাম। এতে তাৎক্ষণিক বমি ভাব লাগা অনেকটা কমে যেত। ট্রাই করে দেখতে পারেন আপু।', createdAt: new Date(Date.now() - 32 * 3600000).toISOString() },
      { authorName: isEn ? 'Dr. Tania Rahman' : 'ডাঃ তানিয়া রহমান', content: isEn ? 'Nausea in the first trimester is normal. However, if you cannot retain any food, consult your physician promptly.' : 'প্রথম তিন মাস বমি হওয়া স্বাভাবিক। তবে যদি সারাদিন কিছুই না পচে এবং শরীর অবসন্ন হয়ে যায়, দ্রুত প্রস্রাব পরীক্ষা করাতে হবে এবং ওরাল ডিহাইড্রেশন বা ডক্টরের পরামর্শে ওষুধ নিতে হবে।', createdAt: new Date(Date.now() - 20 * 3600000).toISOString() }
    ],
    'post-2': [
      { authorName: isEn ? 'Farida Akter' : 'ফরিদা আক্তার', content: isEn ? 'I used the 4-7-8 breathing technique regularly before sleep. It really relaxes the brain!' : 'আমিও আগের রাতে ঘুমাতে পারতাম না। পরে নিশ্বাসের ৪-৭-৮ ব্যায়ামটি নিয়মিত করা শুরু করি। এটি সত্যিই মস্তিস্ক শিথিল করে দেয়, চেষ্টা করুন আপু!', createdAt: new Date(Date.now() - 6 * 3600000).toISOString() }
    ]
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    await createForumPost(newPostCategory, newPostTitle, newPostContent);
    setNewPostTitle('');
    setNewPostContent('');
    setShowCreator(false);
    triggerSimulationNotification(
      isEn ? 'Forum Post Created' : 'ফোরাম পোস্ট সফল', 
      isEn 
        ? 'Your question has been anonymously posted to Kalpa Forum.' 
        : 'আপনার গোপনীয়তা সুরক্ষিত রেখে প্রশ্নটি সফলভাবে কল্প ফোরামে পোস্ট করা হয়েছে।'
    );
  };

  const handlePostComment = (postId: string) => {
    if (!commentInputStr.trim() || !profile) return;

    const freshComment = {
      authorName: profile.displayName || (isEn ? 'Kalpa Member' : 'কল্প সদস্য'),
      content: commentInputStr,
      createdAt: new Date().toISOString()
    };

    setThreadComments(prev => ({
      ...prev,
      [postId]: prev[postId] ? [...prev[postId], freshComment] : [freshComment]
    }));

    setCommentInputStr('');
    triggerSimulationNotification(
      isEn ? 'Comment Added' : 'টিপ্পনী যোগ হয়েছে', 
      isEn ? 'Your comment has been posted successfully.' : 'আপনার মন্তব্যটি সফলভাবে ফোরামে যোগ করা হয়েছে।'
    );
  };

  // Filter posts based on tags & search
  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                          post.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryLabel = (cat: string) => {
    if (isEn) {
      switch (cat) {
        case 'fertility': return 'Fertility & Conception';
        case 'pregnancy': return 'Pregnancy';
        case 'menopause': return 'Menopause & Aging';
        case 'mental-health': return 'Mental Wellness';
        default: return 'General Health';
      }
    }
    switch (cat) {
      case 'fertility': return 'উর্বরতা ও গর্ভধারণ';
      case 'pregnancy': return 'গর্ভাবস্থা';
      case 'menopause': return 'মেনোপজ ও বার্ধক্য';
      case 'mental-health': return 'মানসিক সুস্থতা';
      default: return 'সাধারণ স্বাস্থ্য';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header and navigation tabs */}
      <div className="bg-gradient-to-r from-[#fff0f5] via-[#fff5f8] to-[#fdf2f8] border border-[#fce7f3] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#e11d48] to-[#db2777] text-white p-3 rounded-2xl shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-[#2d1527] flex items-center gap-2">
                {isEn ? 'Kalpa Peer Support Forum' : 'কল্প সহমর্মী ফোরাম'}
              </h3>
              <p className="text-xs text-[#703848] font-sans">
                {isEn ? 'A confidential, supportive space for women\'s health discussions.' : 'গোপনীয়তা বজায় রেখে নারীদের পরস্পর সহযোগী মিলনস্থল'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreator(!showCreator)}
            className="bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] text-white font-sans font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-200/80"
          >
            <Sparkles className="w-4 h-4" />
            {isEn ? 'New Question / Post' : 'নতুন প্রশ্ন বা পোস্ট যোগ করুন'}
          </button>
        </div>

        {/* Security / Confidentiality Notice */}
        <div className="mt-4 bg-white/90 border border-[#fce7f3] p-3 rounded-2xl flex items-center gap-2 text-[10px] text-[#703848] font-sans">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {isEn 
              ? 'To protect your identity, you can set an anonymous nickname from your Profile settings at any time.' 
              : 'আপনার আসল পরিচয় সম্পূর্ণ গোপন রাখতে চাইলে আপনি ড্যাশবোর্ড থেকে যেকোন সময় আপনার ছদ্মনাম (Nickname) সিলেক্ট করতে পারেন।'}
          </span>
        </div>

        {/* Search Input Box */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-[#703848] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={isEn ? "Search forum topics or health solutions..." : "ফোরামে টপিক বা সমস্যার সমাধান খুঁজুন..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#fce7f3] rounded-2xl pl-10 pr-4 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-[#fce7f3] rounded-2xl px-3 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
            >
              <option value="all">{isEn ? 'All Categories' : 'সব ক্যাটাগরি (All discussions)'}</option>
              <option value="fertility">{isEn ? 'Fertility' : 'উর্বরতা ও গর্ভধারণ (Fertility)'}</option>
              <option value="pregnancy">{isEn ? 'Pregnancy' : 'গর্ভাবস্থা (Pregnancy)'}</option>
              <option value="menopause">{isEn ? 'Menopause (40+)' : 'মেনোপজ (Menopause/Forty+)'}</option>
              <option value="mental-health">{isEn ? 'Mental Health' : 'মানসিক সুস্থতা (Mental Health)'}</option>
              <option value="general">{isEn ? 'General Discussion' : 'সাধারণ আলোচনা (General)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* CREATE POST FORM COMPONENT */}
      {showCreator && (
        <form onSubmit={handleCreatePost} className="bg-white border border-[#fce7f3] rounded-3xl p-5 space-y-4 animate-fade-in shadow-sm">
          <h4 className="text-xs font-sans font-bold text-[#be185d]">
            {isEn ? 'Draft a new forum topic or question:' : 'নতুন ফোরাম প্রশ্ন বা সমস্যা ড্রাফট করুন:'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-sans font-bold text-[#2d1527] mb-1">
                {isEn ? 'Category:' : 'ক্যাটাগরি নির্ধারণ করুন:'}
              </label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value as any)}
                className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
              >
                <option value="general">{isEn ? 'General Health' : 'সাধারণ স্বাস্থ্য (General)'}</option>
                <option value="fertility">{isEn ? 'Fertility & Conception' : 'উর্বরতা ও গর্ভধারণ (Fertility)'}</option>
                <option value="pregnancy">{isEn ? 'Pregnancy & Maternity' : 'গর্ভধারণ ও মেটারনিটি (Pregnancy)'}</option>
                <option value="menopause">{isEn ? 'Menopause Care' : 'মেনোপজ রিলেটেড কেয়ার (Menopause)'}</option>
                <option value="mental-health">{isEn ? 'Mental Health & Stress' : 'মানসিক প্রশান্তি ও স্ট্রেস (Mental Health)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold text-[#2d1527] mb-1">
                {isEn ? 'Topic Title:' : 'টপিক শিরোনাম (সংক্ষিপ্ত):'}
              </label>
              <input
                type="text"
                placeholder={isEn ? "e.g., Remedies for early morning nausea?" : "যেমন: গর্ভাবস্থার প্রথম দিকে তীব্র বমি প্রতিকার কী?"}
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold text-[#2d1527] mb-1">
              {isEn ? 'Details & Description:' : 'বিস্তারিত বিবরণ লিখুন:'}
            </label>
            <textarea
              rows={3}
              placeholder={isEn ? "Describe your question or experience so members can help..." : "আপনার অনুভূতি ও সমস্যা বিস্তারিত উল্লেখ করুন যাতে ফোরামের আপুরা সাহায্য করতে পারেন..."}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-[#fffbfc] border border-[#fce7f3] rounded-xl px-3 py-2 text-xs font-sans text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48] resize-none"
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="px-4 py-1.5 border border-[#fce7f3] text-[#703848] rounded-xl text-xs font-sans hover:bg-[#fff0f5]"
            >
              {isEn ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] text-white rounded-xl text-xs font-sans font-bold cursor-pointer shadow-xs"
            >
              {isEn ? 'Post Anonymously' : 'অজ্ঞাতনামা ফোরামে পাবলিশ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* POSTS SCROLL AREA */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-[#fce7f3] rounded-3xl p-12 text-center">
            <p className="text-xs text-[#703848] font-sans">
              {isEn ? 'No discussions found matching your search. Feel free to create a new post!' : 'অনুসন্ধানের সাথে মিলছে কোনো প্রশ্নের সন্ধান পাওয়া যায়নি। নতুন একটি পোস্ট তৈরি করতে পারেন!'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = user && post.likes.includes(user.uid);
            const isExpanded = expandedPostId === post.postId;
            const comments = threadComments[post.postId] || [];
            const dateLocale = isEn ? 'en-US' : 'bn-BD';

            return (
              <div
                key={post.postId}
                className="bg-white border border-[#fce7f3] rounded-3xl p-5 shadow-sm space-y-4 transition-all"
              >
                {/* Meta details */}
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                  <span className="bg-[#fff0f5] text-[#be185d] font-sans font-bold px-2 py-0.5 rounded-md border border-[#fce7f3]">
                    {getCategoryLabel(post.category)}
                  </span>
                  <span>
                    {isEn ? 'Posted by: ' : 'পোস্ট করেছেন: '}
                    <span className="font-sans font-bold text-[#be185d]">{post.authorName}</span> • {new Date(post.createdAt).toLocaleDateString(dateLocale)}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-sans font-bold text-[#2d1527] text-sm hover:text-[#e11d48] transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-xs text-[#703848] mt-1.5 leading-relaxed font-sans">
                    {post.content}
                  </p>
                </div>

                {/* Buttons controls */}
                <div className="flex items-center gap-5 pt-2 border-t border-[#fce7f3] text-xs">
                  <button
                    onClick={() => toggleLikePost(post.postId)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isLiked ? 'text-rose-600 font-bold' : 'text-gray-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>
                      {isEn ? 'Helpful' : 'উপকারী'} ({post.likes.length + (post.postId === 'post-1' && post.likes.length === 1 ? 7 : 0)})
                    </span>
                  </button>

                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : post.postId)}
                    className="flex items-center gap-1.5 text-[#be185d] hover:text-[#9d174d] cursor-pointer font-medium"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    <span>
                      {isEn ? 'Comments' : 'মন্তব্য'} ({comments.length ? comments.length : post.commentsCount})
                    </span>
                  </button>
                </div>

                {/* EXPANDED COMMENTS ACCORDION */}
                {isExpanded && (
                  <div className="bg-[#fff9fa] border border-[#fce7f3] p-4 rounded-2xl mt-3 space-y-3 animate-fade-in text-xs font-sans">
                    <p className="font-bold text-[#be185d] mb-1 pb-1 border-b border-[#fce7f3]">
                      {isEn ? 'Comments:' : 'মন্তব্যসমূহ (Comments):'}
                    </p>
                    
                    {comments.length === 0 ? (
                      <p className="text-gray-400 text-center py-2 text-[11px]">
                        {isEn ? 'No comments yet. Be the first to share your thoughts!' : 'এখনো কেউ মন্তব্য লেখেননি, সহযোগিতার হাত বাড়িয়ে প্রথম মন্তব্যটি লিখুন!'}
                      </p>
                    ) : (
                      comments.map((comment, index) => (
                        <div key={index} className="bg-white border border-[#fce7f3] p-2.5 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                            <span className="font-bold text-[#be185d]">{comment.authorName}</span>
                            <span className="font-mono">{new Date(comment.createdAt).toLocaleDateString(dateLocale)}</span>
                          </div>
                          <p className="text-[#2d1527] leading-relaxed text-[11px]">{comment.content}</p>
                        </div>
                      ))
                    )}

                    {/* Submit Comment Input bar inline */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder={isEn ? "Write a helpful comment or advice..." : "আপনার মূল্যবান গঠনমূলক পরামর্শ বা মন্তব্য লিখুন..."}
                        value={commentInputStr}
                        onChange={(e) => setCommentInputStr(e.target.value)}
                        className="flex-1 bg-white border border-[#fce7f3] rounded-xl px-3 py-1.5 text-xs text-[#2d1527] focus:outline-none focus:ring-1 focus:ring-[#e11d48]"
                      />
                      <button
                        onClick={() => handlePostComment(post.postId)}
                        className="bg-gradient-to-r from-[#e11d48] to-[#db2777] hover:from-[#be185d] hover:to-[#c026d3] text-white font-sans px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 font-bold cursor-pointer transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isEn ? 'Post' : 'মন্তব্য করুন'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

