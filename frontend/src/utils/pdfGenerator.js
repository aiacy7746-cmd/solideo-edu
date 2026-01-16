import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * 5분간의 모니터링 데이터로 PDF 리포트 생성
 * @param {Array} historyData - 5분간의 히스토리 데이터
 * @returns {Promise<void>}
 */
export async function generatePDFReport(historyData) {
    if (!historyData || historyData.length === 0) {
        alert('리포트 생성을 위한 데이터가 없습니다.');
        return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // 통계 계산
    const stats = calculateStats(historyData);

    // 제목
    pdf.setFontSize(22);
    pdf.setTextColor(0, 150, 255);
    pdf.text('System Resource Monitor Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // 날짜/시간
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    const now = new Date();
    pdf.text(`Generated: ${now.toLocaleString('ko-KR')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    pdf.text(`Data Period: ${historyData.length} seconds (${(historyData.length / 60).toFixed(1)} minutes)`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // 구분선
    pdf.setDrawColor(200);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // CPU 섹션
    yPos = addSection(pdf, 'CPU Usage', stats.cpu, yPos, margin, pageWidth);

    // GPU 섹션
    if (stats.gpu.available) {
        yPos = addSection(pdf, 'GPU Usage', stats.gpu, yPos, margin, pageWidth);
    }

    // 메모리 섹션
    yPos = addSection(pdf, 'Memory Usage', stats.memory, yPos, margin, pageWidth);

    // 디스크 섹션
    yPos = addSection(pdf, 'Disk Usage', stats.disk, yPos, margin, pageWidth);

    // 네트워크 섹션
    yPos = addNetworkSection(pdf, 'Network Traffic', stats.network, yPos, margin, pageWidth);

    // 대시보드 스크린샷 캡처
    const dashboardElement = document.querySelector('.dashboard-grid');
    if (dashboardElement) {
        // 새 페이지 추가
        pdf.addPage();
        yPos = margin;

        pdf.setFontSize(16);
        pdf.setTextColor(0, 150, 255);
        pdf.text('Dashboard Screenshot', margin, yPos);
        yPos += 10;

        try {
            const canvas = await html2canvas(dashboardElement, {
                backgroundColor: '#0a0a0f',
                scale: 1.5
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (canvas.height / canvas.width) * imgWidth;

            if (yPos + imgHeight > pageHeight - margin) {
                pdf.addPage();
                yPos = margin;
            }

            pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, Math.min(imgHeight, pageHeight - yPos - margin));
        } catch (e) {
            console.error('Failed to capture dashboard:', e);
        }
    }

    // PDF 저장
    const filename = `system_report_${now.toISOString().slice(0, 10)}_${now.getHours()}-${now.getMinutes()}.pdf`;
    pdf.save(filename);
}

/**
 * 통계 계산
 */
function calculateStats(historyData) {
    const cpuValues = historyData.map(d => d.cpu?.usage_percent || 0);
    const memValues = historyData.map(d => d.memory?.usage_percent || 0);
    const diskValues = historyData.map(d => d.disk?.primary?.usage_percent || 0);
    const gpuValues = historyData.map(d => d.gpu?.primary?.usage_percent || 0);
    const uploadValues = historyData.map(d => d.network?.bytes_sent_speed_mbps || 0);
    const downloadValues = historyData.map(d => d.network?.bytes_recv_speed_mbps || 0);

    const lastData = historyData[historyData.length - 1];

    return {
        cpu: {
            avg: average(cpuValues),
            max: Math.max(...cpuValues),
            min: Math.min(...cpuValues),
            current: cpuValues[cpuValues.length - 1] || 0
        },
        gpu: {
            available: lastData?.gpu?.available || false,
            avg: average(gpuValues),
            max: Math.max(...gpuValues),
            min: Math.min(...gpuValues),
            current: gpuValues[gpuValues.length - 1] || 0
        },
        memory: {
            avg: average(memValues),
            max: Math.max(...memValues),
            min: Math.min(...memValues),
            current: memValues[memValues.length - 1] || 0,
            total: lastData?.memory?.total_gb || 0
        },
        disk: {
            avg: average(diskValues),
            max: Math.max(...diskValues),
            min: Math.min(...diskValues),
            current: diskValues[diskValues.length - 1] || 0,
            total: lastData?.disk?.primary?.total_gb || 0
        },
        network: {
            uploadAvg: average(uploadValues),
            uploadMax: Math.max(...uploadValues),
            downloadAvg: average(downloadValues),
            downloadMax: Math.max(...downloadValues),
            totalSent: lastData?.network?.bytes_sent_total_mb || 0,
            totalRecv: lastData?.network?.bytes_recv_total_mb || 0
        }
    };
}

function average(arr) {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

/**
 * 섹션 추가 (표 형식)
 */
function addSection(pdf, title, stats, yPos, margin, pageWidth) {
    // 제목
    pdf.setFontSize(14);
    pdf.setTextColor(60, 60, 60);
    pdf.text(title, margin, yPos);
    yPos += 8;

    // 테이블 헤더
    const colWidth = (pageWidth - margin * 2) / 4;
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text('Current', margin, yPos);
    pdf.text('Average', margin + colWidth, yPos);
    pdf.text('Maximum', margin + colWidth * 2, yPos);
    pdf.text('Minimum', margin + colWidth * 3, yPos);
    yPos += 5;

    // 테이블 값
    pdf.setFontSize(11);
    pdf.setTextColor(40);
    pdf.text(`${stats.current.toFixed(1)}%`, margin, yPos);
    pdf.text(`${stats.avg.toFixed(1)}%`, margin + colWidth, yPos);
    pdf.text(`${stats.max.toFixed(1)}%`, margin + colWidth * 2, yPos);
    pdf.text(`${stats.min.toFixed(1)}%`, margin + colWidth * 3, yPos);
    yPos += 12;

    return yPos;
}

/**
 * 네트워크 섹션 추가
 */
function addNetworkSection(pdf, title, stats, yPos, margin, pageWidth) {
    pdf.setFontSize(14);
    pdf.setTextColor(60, 60, 60);
    pdf.text(title, margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(40);

    pdf.text(`Upload Avg: ${stats.uploadAvg.toFixed(3)} MB/s`, margin, yPos);
    pdf.text(`Upload Max: ${stats.uploadMax.toFixed(3)} MB/s`, margin + 60, yPos);
    yPos += 6;

    pdf.text(`Download Avg: ${stats.downloadAvg.toFixed(3)} MB/s`, margin, yPos);
    pdf.text(`Download Max: ${stats.downloadMax.toFixed(3)} MB/s`, margin + 60, yPos);
    yPos += 6;

    pdf.text(`Total Sent: ${(stats.totalSent / 1024).toFixed(2)} GB`, margin, yPos);
    pdf.text(`Total Received: ${(stats.totalRecv / 1024).toFixed(2)} GB`, margin + 60, yPos);
    yPos += 12;

    return yPos;
}

export default generatePDFReport;
