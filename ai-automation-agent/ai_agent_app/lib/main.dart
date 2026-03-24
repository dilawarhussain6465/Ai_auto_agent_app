import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: ChatScreen());
  }
}

class ChatScreen extends StatefulWidget {
  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final controller = TextEditingController();
  List messages = [];

  Future sendMessage(String text) async {
    final res = await http.post(
      Uri.parse("http://10.0.2.2:5000/api/agent"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"userMessage": text}),
    );

    final data = jsonDecode(res.body);
    setState(() {
      messages.add({"role": "user", "text": text});
      messages.add({"role": "bot", "text": data['reply']});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("AI Agent")),
      body: Column(children: [
        Expanded(
          child: ListView(
            children: messages.map((m) => ListTile(title: Text(m['text']))).toList(),
          ),
        ),
        Row(children: [
          Expanded(child: TextField(controller: controller)),
          IconButton(icon: const Icon(Icons.send), onPressed: () {
            sendMessage(controller.text);
            controller.clear();
          })
        ])
      ]),
    );
  }
}
