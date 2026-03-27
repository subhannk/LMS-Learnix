const VideoPlayer = ({ url }) => {
  if (!url) return <p className="text-gray-500">No video available.</p>

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
      <video
        src={url}
        controls
        className="w-full h-full"
        controlsList="nodownload"
      />
    </div>
  )
}

export default VideoPlayer