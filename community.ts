export const communityPage = (user: string, chatContainer: string): string => {
  return ` 
  <div class="w-screen flex h-screen border-red-500">
  <-- Chat -->
  ${chatContainer}
  <!--  <div id="canvas-container" class="z-0 w-full h-full"></div> -->
  </div>

  <header
    class="flex justify-center items-center fixed w-full h-10 bg-[#101010] k top-0 px-5"
  >
  <nav class="text-white flex gap-4">
  <a href="/" data-link>Home</a>
  <a href="/#/community" data-link>Community</a>
  <h3 id="user-tag" class="text-white font-thin text-sm">${user}</h3>
</nav> 
  </header>
  <!--scripts-->
`;
};
