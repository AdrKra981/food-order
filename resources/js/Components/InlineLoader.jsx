export default function InlineLoader({ text = "Loading...", className = "" }) {
    return (
        <div
            className={`flex items-center justify-center space-x-2 ${className}`}
        >
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div
                    className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                    className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                ></div>
            </div>
            {text && <span className="text-sm text-gray-600">{text}</span>}
        </div>
    );
}
