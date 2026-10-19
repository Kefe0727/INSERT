"use client";

import { useEffect, useState } from "react";

interface CoverConfirmModalProps {
    onConfirm: (showCover: boolean) => void;
}

export default function CoverConfirmModal({ onConfirm }: CoverConfirmModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // sessionStorage에서 기존 설정 확인
        const savedPreference = sessionStorage.getItem("showCover");

        if (savedPreference === null) {
            // 처음 접속한 경우 모달 노출
            setIsOpen(true);
        } else {
            // 기존 선택값이 존재하는 경우 부모에게 전달
            onConfirm(savedPreference === "true");
        }
    }, []);

    const handleSelect = (show: boolean) => {
        sessionStorage.setItem("showCover", String(show));
        onConfirm(show);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
                <h2 className="text-lg font-bold mb-3">도서 표지 표시 설정</h2>
                <p className="text-sm text-gray-600 mb-6">
                    후방 주의! 메인 페이지에서 도서 표지 이미지를 기본으로 렌더링할까요?
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => handleSelect(true)}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded font-bold hover:bg-blue-600 transition"
                    >
                        표지 보기
                    </button>
                    <button
                        onClick={() => handleSelect(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded font-bold hover:bg-gray-300 transition"
                    >
                        숨기기
                    </button>
                </div>
            </div>
        </div>
    );
}