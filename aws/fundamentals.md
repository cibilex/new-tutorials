- AWS uses a \*pay-as-you-go approach, meaning there are no fixed monthly or yearly subscriptions. You only pay for the resources and services you actually use.

---

## AWS Networking Gateways

### 🌍 **Internet Gateway (IGW)**

- **Bidirectional** entry/exit point between VPC and public internet
- **Horizontally scaled and redundant** - AWS manages availability automatically
- **One per VPC limit** - cannot attach multiple IGWs to single VPC
- Requires **route table configuration** pointing 0.0.0.0/0 to IGW
- EC2 instances need **public IP or Elastic IP** to communicate through IGW
- **No bandwidth limits** - scales automatically based on demand
- Used for web servers, load balancers, bastion hosts in public subnets

### 🔒 **VPN (Virtual Private Network)**

- **Encrypted IPSec tunnel** over public internet between two endpoints
- **Site-to-Site VPN**: connects entire on-premises network to AWS VPC
- **Client VPN**: allows individual users/devices to connect securely
- **Bandwidth**: up to 1.25 Gbps per tunnel (can use multiple tunnels)
- **Latency considerations** - encryption overhead + internet dependency
- **Cost-effective** alternative to dedicated Direct Connect lines
- Supports **redundant tunnels** for high availability
- Uses **BGP or static routing** for path selection

### 🏠 **Virtual Private Gateway (VGW)**

- **AWS-managed VPN concentrator** on AWS side of VPN connection
- **No internet access** - purely for private on-premises connectivity
- Requires **Customer Gateway (CGW)** configuration on your network
- Supports **multiple VPN connections** from different sites
- Can be **shared across multiple VPCs** using Transit Gateway
- **Route propagation** - automatically updates route tables
- Works with **Direct Connect** for hybrid connectivity scenarios

### 🚇 **Transit Gateway (TGW)**

- **Regional network hub** connecting VPCs, VPNs, and Direct Connect
- **Simplifies architecture** - hub-and-spoke replaces complex mesh topology
- **Inter-region peering** - connect Transit Gateways across regions
- **Route table control** - granular traffic flow management between networks
- **Bandwidth**: up to 50 Gbps between attachments
- **Cost optimization** - reduces multiple NAT Gateway needs
- **Security groups** work across VPC boundaries through TGW
- Example: 10 VPCs need only 10 connections (vs 45 in mesh topology)

### 🔄 **NAT Gateway**

- **Network Address Translation** for outbound-only internet access
- **Unidirectional** - private resources → internet (internet cannot initiate back)
- **Must be in public subnet** with route to Internet Gateway
- **Availability Zone specific** - deploy one per AZ for high availability
- **Managed service** - AWS handles patching, scaling, redundancy
- **Bandwidth**: auto-scales from 5 Gbps to 45 Gbps
- **Use cases**: software updates, API calls, package downloads from private instances
- **Alternative**: NAT Instance (self-managed EC2) for custom requirements
- **Cost**: charges for hourly usage + data processing
