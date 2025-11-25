// src/components/Achievements/AddGoalModal.jsx
import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default function AddGoalModal({ show, onClose, onAdd }) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [required, setRequired] = useState(1);
    const [icon, setIcon] = useState("trophy");

    const submit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd({
            id: `g_${Date.now()}`,
            title: title.trim(),
            description: desc.trim(),
            required: Math.max(1, Number(required) || 1),
            icon,
        });
        // reset & close
        setTitle("");
        setDesc("");
        setRequired(1);
        setIcon("trophy");
        onClose();
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add New Goal</Modal.Title>
            </Modal.Header>
            <Form onSubmit={submit}>
                <Modal.Body>
                    <Form.Group className="mb-2">
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Walk 10k steps" required />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Description</Form.Label>
                        <Form.Control value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description" />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Required (number)</Form.Label>
                        <Form.Control type="number" min="1" value={required} onChange={(e) => setRequired(e.target.value)} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Icon</Form.Label>
                        <Form.Select value={icon} onChange={(e) => setIcon(e.target.value)}>
                            <option value="trophy">Trophy</option>
                            <option value="medal">Medal</option>
                            <option value="star">Star</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Add Goal</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
