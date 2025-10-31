"use client";

import { Eye, Download, FileIcon, X } from "lucide-react";

export default function DocumentsModal({ open, onClose, files }: any) {
  if (!open) return null;

  return (
<div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg border border-gray-200">
        <div className="flex justify-between mb-3">
          <h2 className="font-medium text-gray-700 text-lg">Uploaded Files</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>

        <div className="space-y-2">
          {files?.map((file: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-gray-400" />
                <span className="truncate max-w-[180px] text-sm text-gray-700">
                  {file.fileName}
                </span>
              </div>

              <div className="flex gap-3">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </a>

                <a
                  href={file.fileUrl}
                  download={file.fileName}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm bg-black text-white px-4 py-1 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
