#!/bin/bash

# SS4 Daily Context Archive Script
# This script creates a daily snapshot of the entire SS4 workspace
# Including all projects, knowledge base, and configuration

# Set up logging
log() {
    echo "[SS4 Archive] $(date '+%Y-%m-%d %H:%M:%S'): $1"
}

# Configuration
SS4_ROOT="/home/neo/SS4"
ARCHIVE_ROOT="/home/neo/SS4/archive/daily"
DATE_FORMAT=$(date '+%Y-%m-%d')
ARCHIVE_NAME="ss4-context-${DATE_FORMAT}.tar.gz"
KEEP_DAYS=7  # Keep a week of daily archives

# Ensure archive directory exists
mkdir -p "${ARCHIVE_ROOT}"

# Create exclusion list for cleaner archives
cat > "${SS4_ROOT}/.archiveignore" << EOF
node_modules/
.next/
.vercel/
*.log
tmp/
.git/
archive/daily/
EOF

log "Starting daily SS4 context archive"

# Create the archive
tar --exclude-from="${SS4_ROOT}/.archiveignore" \
    -czf "${ARCHIVE_ROOT}/${ARCHIVE_NAME}" \
    -C "/home/neo" \
    SS4/

# Verify archive
if [ $? -eq 0 ]; then
    log "Successfully created archive: ${ARCHIVE_NAME}"
    
    # Calculate archive size
    SIZE=$(du -h "${ARCHIVE_ROOT}/${ARCHIVE_NAME}" | cut -f1)
    log "Archive size: ${SIZE}"
    
    # Create archive manifest
    MANIFEST="${ARCHIVE_ROOT}/${DATE_FORMAT}-manifest.md"
    echo "# SS4 Context Archive Manifest - ${DATE_FORMAT}" > "${MANIFEST}"
    echo "" >> "${MANIFEST}"
    echo "## Archive Contents" >> "${MANIFEST}"
    echo "\`\`\`" >> "${MANIFEST}"
    tar -tvf "${ARCHIVE_ROOT}/${ARCHIVE_NAME}" >> "${MANIFEST}"
    echo "\`\`\`" >> "${MANIFEST}"
    
    # Add git status if available
    echo "" >> "${MANIFEST}"
    echo "## Git Status" >> "${MANIFEST}"
    echo "\`\`\`" >> "${MANIFEST}"
    cd "${SS4_ROOT}/p1" && git status >> "${MANIFEST}" 2>&1
    echo "\`\`\`" >> "${MANIFEST}"
    
    # Add environment status
    echo "" >> "${MANIFEST}"
    echo "## Environment Status" >> "${MANIFEST}"
    echo "\`\`\`" >> "${MANIFEST}"
    echo "Node version: $(node -v)" >> "${MANIFEST}"
    echo "NPM version: $(npm -v)" >> "${MANIFEST}"
    echo "Vercel CLI: $(vercel -v)" >> "${MANIFEST}"
    echo "\`\`\`" >> "${MANIFEST}"
    
    log "Created archive manifest: ${MANIFEST}"
else
    log "Error creating archive"
    exit 1
fi

# Cleanup old archives
find "${ARCHIVE_ROOT}" -name "ss4-context-*.tar.gz" -mtime +${KEEP_DAYS} -delete
find "${ARCHIVE_ROOT}" -name "*-manifest.md" -mtime +${KEEP_DAYS} -delete

log "Cleaned up archives older than ${KEEP_DAYS} days"
log "Daily archive complete" 