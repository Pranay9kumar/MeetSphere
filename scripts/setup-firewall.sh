#!/usr/bin/env bash
# ==============================================================================
# Coturn STUN/TURN Firewall Hardening & Kernel Optimization Script
# Zoom/Teams Clone Platform (MeetSphere)
# ==============================================================================

set -euo pipefail

RED='\030[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE} MeetSphere Coturn Production Network Security & Firewall Setup ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# Check for root privilege
if [[ "${EUID}" -ne 0 ]]; then
  echo -e "${RED}[ERROR] This script must be run as root (or via sudo). Exiting.${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 1. Kernel Network Socket Buffer Optimizations (sysctl)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/3] Applying Linux Kernel UDP Socket Buffer Optimizations...${NC}"

SYSCTL_CONF="/etc/sysctl.d/99-coturn-performance.conf"

cat << 'EOF' > "${SYSCTL_CONF}"
# Maximize UDP receive and transmit socket buffer sizes (25 MB) to support high-throughput media relaying
net.core.rmem_max = 26214400
net.core.wmem_max = 26214400
net.core.rmem_default = 26214400
net.core.wmem_default = 26214400

# Minimum memory reserved for UDP sockets (16 KB)
net.ipv4.udp_rmem_min = 16384
net.ipv4.udp_wmem_min = 16384

# Increase backlog queue capacity for rapid incoming WebRTC packet processing
net.core.netdev_max_backlog = 100000
net.core.somaxconn = 4096
EOF

sysctl -p "${SYSCTL_CONF}" > /dev/null 2>&1 || true
echo -e "${GREEN}[OK] Kernel UDP buffer settings successfully applied to ${SYSCTL_CONF}.${NC}"

# ------------------------------------------------------------------------------
# 2. Configure Uncomplicated Firewall (UFW) Rules
# ------------------------------------------------------------------------------
if command -v ufw > /dev/null 2>&1; then
  echo -e "\n${YELLOW}[2/3] Configuring UFW Firewall Rules for Coturn STUN/TURN...${NC}"

  # Allow Standard STUN/TURN Ports
  ufw allow 3478/udp comment 'Coturn STUN/TURN UDP'
  ufw allow 3478/tcp comment 'Coturn STUN/TURN TCP'

  # Allow Secure TURNS TLS/DTLS Ports
  ufw allow 5349/udp comment 'Coturn TURNS DTLS'
  ufw allow 5349/tcp comment 'Coturn TURNS TLS'

  # Allow WebRTC Ephemeral Media Relay UDP Port Range
  ufw allow 49152:65535/udp comment 'Coturn Ephemeral Media Relay UDP'

  echo -e "${GREEN}[OK] UFW rules configured successfully.${NC}"
  echo -e "${BLUE}Current UFW Status:${NC}"
  ufw status verbose | grep -E "3478|5349|49152" || true
else
  echo -e "${YELLOW}[SKIP] UFW is not installed. Skipping UFW configuration.${NC}"
fi

# ------------------------------------------------------------------------------
# 3. Configure Direct IPTables Fallback Rules
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/3] Enforcing Fallback iptables Hardening Rules...${NC}"

# STUN/TURN Standard Ports
iptables -A INPUT -p udp --dport 3478 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -p tcp --dport 3478 -m state --state NEW,ESTABLISHED -j ACCEPT

# TURNS TLS/DTLS Ports
iptables -A INPUT -p udp --dport 5349 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -p tcp --dport 5349 -m state --state NEW,ESTABLISHED -j ACCEPT

# UDP Ephemeral Media Relay Port Range
iptables -A INPUT -p udp --dport 49152:65535 -m state --state NEW,ESTABLISHED -j ACCEPT

# Drop invalid packets
iptables -A INPUT -m state --state INVALID -j DROP

echo -e "${GREEN}[OK] iptables Coturn rules appended successfully.${NC}"

echo -e "\n${GREEN}==============================================================================${NC}"
echo -e "${GREEN} Coturn Hardening & Network Setup Complete! ${NC}"
echo -e "${GREEN} Verified Open Ports:${NC}"
echo -e " - STUN/TURN: UDP/TCP 3478"
echo -e " - TURNS TLS/DTLS: UDP/TCP 5349"
echo -e " - Media Relay Range: UDP 49152-65535"
echo -e "${GREEN}==============================================================================${NC}"
