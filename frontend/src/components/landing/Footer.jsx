import React from 'react'
import {  ChevronDown } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#5865F2] mt-auto">
        <div className="container mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Language & Social */}
            <div className="space-y-6">
              <svg className="w-12 h-12 text-white" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
              </svg>

              <div className="space-y-3">
                <p className="text-white text-sm font-semibold">Language</p>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-all w-full justify-between">
                  <span className="text-sm font-medium">English (UK)</span>
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-white text-sm font-semibold">Social</p>
                <div className="flex gap-4">
                  <a href="#" className="text-white hover:text-gray-200 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-gray-200 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-gray-200 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-gray-200 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-gray-200 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:underline text-sm">Download</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Nitro</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Status</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">App Directory</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:underline text-sm">About</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Jobs</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Brand</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Newsroom</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:underline text-sm">Support</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Safety</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Blog</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Creators</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Community</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Developers</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Quests</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Official Third-Party Merch</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Feedback</a></li>
              </ul>
            </div>

            {/* Policies Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Policies</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:underline text-sm">Terms</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Privacy</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Cookie Settings</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Guidelines</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Acknowledgements</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Licences</a></li>
                <li><a href="#" className="text-white hover:underline text-sm">Company Information</a></li>
              </ul>
            </div>
          </div>

          {/* Large Discord Text */}
          <div className="mt-16 overflow-hidden">
            <h2 className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-black text-white/10 leading-none tracking-tight select-none">
              Discord
            </h2>
          </div>
        </div>
      </footer>
  )
}

export default Footer