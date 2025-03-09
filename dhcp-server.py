from scapy.all import *

def handle_dhcp(packet):
    if DHCP in packet and packet[DHCP].options[0][1] == 1:  # DHCP Discover
        print("Received DHCP Discover")
        offer = Ether(dst=packet[Ether].src)/\
                IP(src="192.168.1.1", dst="192.168.1.100")/\
                UDP(sport=67, dport=68)/\
                BOOTP(op=2, yiaddr="192.168.1.100", siaddr="192.168.1.1", chaddr=packet[BOOTP].chaddr)/\
                DHCP(options=[("message-type", "offer"),
                            ("subnet_mask", "255.255.255.0"),
                            ("router", "192.168.1.1"),
                            ("name_server", "8.8.8.8"),
                            "end"])
        sendp(offer, iface="en0")
        print("Sent DHCP Offer")



def main():
    print("Starting DHCP server...")
    # 选择本机的已经连线的有线网口（osx）
    interfaces = get_if_list()
    print("Available interfaces:")
    for i, iface in enumerate(interfaces):
        print(f"{i}: {iface}")
    iface_index = int(input("Enter the index of the interface you want to use: "))
    iface = interfaces[iface_index]
    print(f"Using interface: {iface}")
    sniff(filter="udp and (port 67 or 68)", prn=handle_dhcp, iface=iface)

if __name__ == "__main__":
    main()
